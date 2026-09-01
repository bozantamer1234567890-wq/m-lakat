import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, LinkButton, Badge, Button } from "@/components/ui";
import { startSession } from "@/app/cases/actions";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  recommendedCategoryFor,
  weakestSkill,
  strongestSkill,
  readinessScore,
  skillForCategory,
  SKILL_LABELS,
} from "@/lib/cases";
import { elapsedLabel, elapsedSeconds, parseTimestampLabel, type TimestampedNote } from "@/lib/ai/interview";
import { extractExhibit } from "@/lib/ai/exhibit";
import type { CaseRow, MessageRow } from "@/lib/types";

/** Bir zaman damgasına en yakın ADAY mesajını bulur — "kanıt" olarak gerçek transkript metnini gösterebilmek için. */
function findEvidenceMessage(
  messages: Pick<MessageRow, "role" | "content" | "created_at">[],
  sessionStartedAt: string,
  timestamp: string
): string | null {
  const target = parseTimestampLabel(timestamp);
  if (target === null) return null;
  const candidates = messages.filter((m) => m.role === "user");
  if (candidates.length === 0) return null;
  const closest = candidates.reduce((best, m) => {
    const diff = Math.abs(elapsedSeconds(sessionStartedAt, m.created_at) - target);
    const bestDiff = Math.abs(elapsedSeconds(sessionStartedAt, best.created_at) - target);
    return diff < bestDiff ? m : best;
  });
  return closest.content;
}

function ScoreBar({
  label,
  value,
  notes,
  messages,
  sessionStartedAt,
}: {
  label: string;
  value: number;
  notes?: TimestampedNote[];
  messages?: Pick<MessageRow, "role" | "content" | "created_at">[];
  sessionStartedAt?: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between text-sm text-brand-700">
        <span>{label}</span>
        <div className="flex items-center gap-2">
          <span className="font-medium">{value}/100</span>
          {notes && notes.length > 0 && messages && sessionStartedAt && (
            <details className="group">
              <summary className="cursor-pointer list-none text-xs text-brand-500 underline decoration-dotted">
                Neden?
              </summary>
              <div className="mt-2 flex flex-col gap-2 rounded-lg bg-surface-muted p-3 text-left">
                {notes.map((note, i) => {
                  const evidence = findEvidenceMessage(messages, sessionStartedAt, note.timestamp);
                  return (
                    <div key={i} className="text-xs">
                      <div className="flex items-center gap-2 text-brand-400">
                        <span className="font-mono">{note.timestamp}</span>
                        <span
                          className={note.type === "strength" ? "text-success" : "text-warning"}
                        >
                          {note.type === "strength" ? "Güçlü yön" : "Gelişim alanı"}
                        </span>
                      </div>
                      {evidence && (
                        <p className="mt-1 rounded-md bg-surface px-2 py-1.5 italic text-brand-700">
                          &ldquo;{evidence}&rdquo;
                        </p>
                      )}
                      <p className="mt-1 text-brand-600">{note.note}</p>
                    </div>
                  );
                })}
              </div>
            </details>
          )}
        </div>
      </div>
      <div className="mt-1 h-2 rounded-full bg-brand-100">
        <div className="h-2 rounded-full bg-brand-500" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

function ReplayTimeline({
  messages,
  sessionStartedAt,
  notes,
}: {
  messages: Pick<MessageRow, "role" | "content" | "created_at">[];
  sessionStartedAt: string;
  notes: TimestampedNote[];
}) {
  return (
    <div className="flex flex-col gap-4">
      {messages
        .filter((m) => m.role !== "system")
        .map((m, i) => {
          const label = elapsedLabel(sessionStartedAt, m.created_at);
          const matchingNotes =
            m.role === "user" ? notes.filter((n) => n.timestamp === label) : [];
          return (
            <div key={i} className="flex gap-3">
              <span className="w-10 shrink-0 pt-0.5 font-mono text-xs text-brand-400">{label}</span>
              <div className="flex-1">
                <p className="text-xs text-brand-400">{m.role === "user" ? "Aday" : "Mülakatçı"}</p>
                <p className="mt-0.5 text-sm text-brand-800">
                  {m.role === "user" ? m.content : extractExhibit(m.content).text}
                </p>
                {matchingNotes.map((note, j) => (
                  <p
                    key={j}
                    className={`mt-1 inline-block rounded-full px-2 py-0.5 text-xs ${
                      note.type === "strength"
                        ? "bg-accent-soft text-success"
                        : "bg-warning/10 text-warning"
                    }`}
                  >
                    {SKILL_LABELS[note.skill]}: {note.note}
                  </p>
                ))}
              </div>
            </div>
          );
        })}
    </div>
  );
}

export default async function FeedbackPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("sessions")
    .select("*, cases(title, category)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();
  if (!session) redirect("/cases");

  let { data: feedback } = await supabase
    .from("feedback")
    .select("*")
    .eq("session_id", id)
    .maybeSingle();

  if (!feedback) {
    // Session completed but feedback wasn't generated yet (e.g. page refresh race) — generate now.
    const base = process.env.NEXT_PUBLIC_SITE_URL ?? "";
    await fetch(`${base}/api/interview/feedback`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: id }),
    }).catch(() => {});
    const retry = await supabase.from("feedback").select("*").eq("session_id", id).maybeSingle();
    feedback = retry.data;
  }

  let nextCase: CaseRow | null = null;
  let weakestLabel: string | null = null;
  if (feedback) {
    weakestLabel = weakestSkill(feedback).label;
    const category = recommendedCategoryFor(feedback);
    const { data: candidate } = await supabase
      .from("cases")
      .select("*")
      .eq("is_published", true)
      .eq("category", category)
      .neq("id", session.case_id)
      .limit(1)
      .maybeSingle();
    nextCase = candidate;
  }

  if (session.kind === "drill") {
    const skillKey = skillForCategory(session.cases!.category);
    const score = feedback ? feedback[skillKey] : null;

    return (
      <div className="mx-auto max-w-md px-6 py-16 text-center">
        <Badge>Drill tamamlandı</Badge>
        <h1 className="mt-4 text-xl font-medium text-brand-900">{SKILL_LABELS[skillKey]}</h1>

        {!feedback || score === null ? (
          <Card className="mt-6">
            <p className="text-sm text-brand-600">Değerlendirme hazırlanıyor, birazdan sayfayı yenile.</p>
          </Card>
        ) : (
          <>
            <p className="mt-4 text-6xl font-semibold tracking-tight text-brand-900">{score}</p>
            <p className="mt-1 text-sm text-brand-500">/ 100</p>
            <Card className="mt-6 text-left">
              <p className="text-sm whitespace-pre-line text-brand-700">{feedback.summary}</p>
            </Card>
          </>
        )}

        <div className="mt-8 flex gap-3">
          <LinkButton href="/dashboard" variant="secondary" className="flex-1">
            Panele dön
          </LinkButton>
          <LinkButton href="/cases" className="flex-1">
            Yeni case dene
          </LinkButton>
        </div>
      </div>
    );
  }

  if (session.kind === "diagnostic") {
    const readiness = feedback ? readinessScore(feedback) : null;
    const strongest = feedback ? strongestSkill(feedback) : null;
    const weakest = feedback ? weakestSkill(feedback) : null;

    return (
      <div className="mx-auto max-w-lg px-6 py-16 text-center">
        <Badge>Hazırlık ölçümü tamamlandı</Badge>

        {!feedback || readiness === null ? (
          <Card className="mt-6">
            <p className="text-sm text-brand-600">Sonuç hazırlanıyor, birazdan sayfayı yenile.</p>
          </Card>
        ) : (
          <>
            <p className="mt-6 text-7xl font-semibold tracking-tight text-brand-900">{readiness}</p>
            <p className="mt-1 text-sm text-brand-500">/ 100 — Interview Readiness</p>

            <div className="mt-8 grid grid-cols-2 gap-4 text-left">
              <Card>
                <p className="text-xs font-medium uppercase tracking-wide text-success">En güçlü</p>
                <p className="mt-2 font-medium text-brand-900">{strongest!.label}</p>
                <p className="text-2xl font-semibold text-brand-900">{strongest!.value}</p>
              </Card>
              <Card>
                <p className="text-xs font-medium uppercase tracking-wide text-warning">En zayıf</p>
                <p className="mt-2 font-medium text-brand-900">{weakest!.label}</p>
                <p className="text-2xl font-semibold text-brand-900">{weakest!.value}</p>
              </Card>
            </div>

            <LinkButton href="/onboarding" className="mt-8 w-full">
              Pratik planımı oluştur →
            </LinkButton>
          </>
        )}
      </div>
    );
  }

  const { data: messages } = feedback
    ? await supabase
        .from("messages")
        .select("role, content, created_at")
        .eq("session_id", id)
        .order("created_at", { ascending: true })
    : { data: null };

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Badge>{session.cases!.title}</Badge>
      <h1 className="mt-3 text-2xl font-semibold text-brand-900">Mülakat sonuç raporu</h1>

      {!feedback ? (
        <Card className="mt-6">
          <p className="text-sm text-brand-600">Rapor hazırlanıyor, birazdan sayfayı yenile.</p>
        </Card>
      ) : (
        <>
          <Card className="mt-6 text-center">
            <p className="text-sm text-brand-600">Genel skor</p>
            <p className="text-5xl font-semibold text-brand-500">{feedback.overall_score}</p>
          </Card>

          <Card className="mt-4 flex flex-col gap-4">
            <ScoreBar
              label="Yapı"
              value={feedback.structure_score}
              notes={feedback.timestamped_notes?.filter((n: TimestampedNote) => n.skill === "structure_score")}
              messages={messages ?? undefined}
              sessionStartedAt={session.started_at}
            />
            <ScoreBar
              label="Analiz"
              value={feedback.analysis_score}
              notes={feedback.timestamped_notes?.filter((n: TimestampedNote) => n.skill === "analysis_score")}
              messages={messages ?? undefined}
              sessionStartedAt={session.started_at}
            />
            <ScoreBar
              label="İş muhakemesi"
              value={feedback.business_judgment_score}
              notes={feedback.timestamped_notes?.filter((n: TimestampedNote) => n.skill === "business_judgment_score")}
              messages={messages ?? undefined}
              sessionStartedAt={session.started_at}
            />
            <ScoreBar
              label="İletişim"
              value={feedback.communication_score}
              notes={feedback.timestamped_notes?.filter((n: TimestampedNote) => n.skill === "communication_score")}
              messages={messages ?? undefined}
              sessionStartedAt={session.started_at}
            />
            <ScoreBar
              label="Sayısal akıl yürütme"
              value={feedback.quantitative_reasoning_score}
              notes={feedback.timestamped_notes?.filter((n: TimestampedNote) => n.skill === "quantitative_reasoning_score")}
              messages={messages ?? undefined}
              sessionStartedAt={session.started_at}
            />
          </Card>

          <Card className="mt-4">
            <h3 className="font-medium text-brand-900">Genel değerlendirme</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-brand-700">{feedback.summary}</p>
          </Card>

          <Card className="mt-4">
            <h3 className="font-medium text-brand-900">Güçlü yönler</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-brand-700">{feedback.strengths}</p>
          </Card>

          <Card className="mt-4">
            <h3 className="font-medium text-brand-900">Gelişim alanları</h3>
            <p className="mt-2 whitespace-pre-line text-sm text-brand-700">{feedback.improvements}</p>
          </Card>

          {messages && messages.length > 0 && (
            <Card className="mt-4">
              <details>
                <summary className="cursor-pointer list-none">
                  <h3 className="inline font-medium text-brand-900">Mülakatı tekrar izle</h3>
                  <span className="ml-2 text-xs text-brand-400">(transkript — ses kaydı yok)</span>
                </summary>
                <div className="mt-4 max-h-[420px] overflow-y-auto pr-1">
                  <ReplayTimeline
                    messages={messages}
                    sessionStartedAt={session.started_at}
                    notes={feedback.timestamped_notes ?? []}
                  />
                </div>
              </details>
            </Card>
          )}

          {nextCase && (
            <Card className="mt-4">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-400">
                Sıradaki pratik önerisi
              </p>
              <p className="mt-2 text-sm text-brand-600">
                En zayıf alanın <strong className="text-brand-900">{weakestLabel}</strong> — bu
                beceriyi geliştirecek bir case seçtik.
              </p>
              <div className="mt-3 flex items-center gap-2">
                <Badge>{CATEGORY_LABELS[nextCase.category]}</Badge>
                <Badge>{DIFFICULTY_LABELS[nextCase.difficulty]}</Badge>
              </div>
              <h4 className="mt-3 font-medium text-brand-900">{nextCase.title}</h4>
              <form action={startSession} className="mt-4 flex gap-2">
                <input type="hidden" name="case_id" value={nextCase.id} />
                <Button type="submit" name="mode" value="text" variant="secondary" className="flex-1">
                  Yazılı başla
                </Button>
                <Button type="submit" name="mode" value="voice" className="flex-1">
                  Sesli başla →
                </Button>
              </form>
            </Card>
          )}
        </>
      )}

      <div className="mt-6 flex gap-3">
        <LinkButton href="/cases" variant="secondary">
          Yeni case dene
        </LinkButton>
        <LinkButton href="/dashboard" variant="ghost">
          Panele dön
        </LinkButton>
      </div>
    </div>
  );
}
