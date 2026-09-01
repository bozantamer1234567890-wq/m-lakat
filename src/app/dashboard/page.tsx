import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, LinkButton, Badge, Button } from "@/components/ui";
import { startSession } from "@/app/cases/actions";
import { FREE_SESSION_LIMIT, isProActive } from "@/lib/iyzico";
import {
  SKILL_LABELS,
  readinessScore,
  weakestSkill,
  categoryForSkill,
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  type SkillKey,
} from "@/lib/cases";
import type { FeedbackRow, SessionRow, CaseRow } from "@/lib/types";

function currentStreak(completedDates: string[]): number {
  const days = Array.from(
    new Set(completedDates.map((d) => new Date(d).toISOString().slice(0, 10)))
  ).sort((a, b) => (a < b ? 1 : -1));
  if (days.length === 0) return 0;

  const oneDay = 24 * 60 * 60 * 1000;
  const today = new Date().toISOString().slice(0, 10);
  const mostRecentGapDays = Math.round(
    (new Date(today).getTime() - new Date(days[0]).getTime()) / oneDay
  );
  if (mostRecentGapDays > 1) return 0; // streak broken if last practice wasn't today/yesterday

  let streak = 1;
  for (let i = 1; i < days.length; i++) {
    const gap = Math.round(
      (new Date(days[i - 1]).getTime() - new Date(days[i]).getTime()) / oneDay
    );
    if (gap === 1) streak++;
    else break;
  }
  return streak;
}

function Sparkline({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const w = 300;
  const h = 60;
  const max = Math.max(...values, 100);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const points = values
    .map((v, i) => {
      const x = (i / (values.length - 1)) * w;
      const y = h - ((v - min) / range) * h;
      return `${x},${y}`;
    })
    .join(" ");
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-14 w-full" preserveAspectRatio="none" aria-hidden>
      <polyline
        fill="none"
        stroke="var(--brand-500)"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
      />
    </svg>
  );
}

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, current_period_end")
    .eq("id", user!.id)
    .single();
  const proActive = isProActive(profile);

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*, cases(title, industry), feedback(*)")
    .eq("user_id", user!.id)
    .order("started_at", { ascending: false })
    .limit(50);

  if (!sessions || sessions.length === 0) redirect("/diagnostic");

  const completed = (sessions ?? []).filter((s) => s.status === "completed" && s.feedback);
  const recentSessions = (sessions ?? []).slice(0, 10);

  const streak = currentStreak(completed.map((s) => s.completed_at!));
  const readinessHistory = completed
    .slice()
    .reverse()
    .map((s) => readinessScore(s.feedback!));
  const currentReadiness = readinessHistory.length ? readinessHistory[readinessHistory.length - 1] : null;
  const previousReadiness =
    readinessHistory.length > 1 ? readinessHistory[readinessHistory.length - 2] : null;
  const readinessTarget = 85;

  const skillAverages = (Object.keys(SKILL_LABELS) as SkillKey[]).map((key) => ({
    key,
    label: SKILL_LABELS[key],
    value: completed.length
      ? Math.round(completed.reduce((sum, s) => sum + s.feedback![key], 0) / completed.length)
      : 0,
  }));
  const strongest = skillAverages.length
    ? skillAverages.reduce((max, s) => (s.value > max.value ? s : max))
    : null;
  const weakest = skillAverages.length
    ? skillAverages.reduce((min, s) => (s.value < min.value ? s : min))
    : null;

  // Recurring mistake: en zayıf beceri son birkaç oturumda tekrar tekrar aynıysa uyar.
  const recentWeakestKeys = completed.slice(0, 5).map((s) => weakestSkill(s.feedback!).key);
  const recurringCounts = recentWeakestKeys.reduce<Partial<Record<SkillKey, number>>>((acc, key) => {
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});
  const recurringEntry = (Object.entries(recurringCounts) as [SkillKey, number][]).sort(
    (a, b) => b[1] - a[1]
  )[0];
  const recurringMistake =
    recurringEntry && recurringEntry[1] >= 2
      ? { key: recurringEntry[0], label: SKILL_LABELS[recurringEntry[0]], count: recurringEntry[1] }
      : null;

  let recurringDrill: CaseRow | null = null;
  if (recurringMistake) {
    const { data: drill } = await supabase
      .from("cases")
      .select("*")
      .eq("is_drill", true)
      .eq("category", categoryForSkill(recurringMistake.key))
      .maybeSingle();
    recurringDrill = drill;
  }

  // Bugünün pratiği: en zayıf beceriyle eşleşen, henüz denenmemiş bir case öner.
  let todaysCase: CaseRow | null = null;
  if (weakest) {
    const attemptedCaseIds = (sessions ?? []).map((s) => s.case_id);
    const targetCategory = categoryForSkill(weakest.key);
    const { data: candidates } = await supabase
      .from("cases")
      .select("*")
      .eq("is_published", true)
      .eq("category", targetCategory)
      .limit(10);
    todaysCase = (candidates ?? []).find((c) => !attemptedCaseIds.includes(c.id)) ?? candidates?.[0] ?? null;
  }

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-brand-900">Panel</h1>
            <Badge>{proActive ? "Pro" : "Ücretsiz"}</Badge>
          </div>
          <p className="text-sm text-brand-600">Hoş geldin{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}.</p>
        </div>
        <div className="flex gap-2">
          <LinkButton href="/pricing" variant="ghost">
            {proActive ? "Aboneliği görüntüle" : "Pro'ya geç"}
          </LinkButton>
          <LinkButton href="/cases">Yeni mülakat başlat</LinkButton>
        </div>
      </div>

      {proActive && profile?.current_period_end && (
        <p className="mt-2 text-xs text-brand-500">
          Pro aboneliğin {new Date(profile.current_period_end).toLocaleDateString("tr-TR")} tarihine kadar aktif.
        </p>
      )}

      {!proActive && (sessions?.length ?? 0) >= FREE_SESSION_LIMIT && (
        <Card className="mt-4 bg-brand-50">
          <p className="text-sm text-brand-800">
            Ücretsiz mülakat hakkını kullandın.{" "}
            <a href="/pricing" className="font-medium underline">
              Pro&apos;ya geçerek
            </a>{" "}
            sınırsız pratik yapmaya devam edebilirsin.
          </p>
        </Card>
      )}

      {todaysCase && weakest && (
        <Card className="mt-6 border-brand-500">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
            Bugün ne pratik etmeliyim?
          </p>
          <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <Badge>{CATEGORY_LABELS[todaysCase.category]}</Badge>
                <Badge>{DIFFICULTY_LABELS[todaysCase.difficulty]}</Badge>
                <span className="text-xs text-brand-400">~{todaysCase.estimated_minutes} dk</span>
              </div>
              <h3 className="mt-2 font-medium text-brand-900">{todaysCase.title}</h3>
              <p className="mt-1 text-sm text-brand-600">
                {weakest.label} skorun ({weakest.value}) hedefinin altında — bu case tam bu beceriyi çalıştırıyor.
              </p>
            </div>
            <form action={startSession} className="flex gap-2">
              <input type="hidden" name="case_id" value={todaysCase.id} />
              <input type="hidden" name="mode" value="text" />
              <Button type="submit">Bugünün pratiğine başla →</Button>
            </form>
          </div>
        </Card>
      )}

      {recurringMistake && (
        <Card className="mt-4 flex flex-wrap items-center justify-between gap-4 bg-surface-muted">
          <div>
            <p className="text-xs font-medium uppercase tracking-wide text-warning">
              Tekrarlayan gelişim alanı
            </p>
            <p className="mt-2 text-sm text-brand-700">
              <strong className="text-brand-900">{recurringMistake.label}</strong>, son {recentWeakestKeys.length}{" "}
              case&apos;in {recurringMistake.count} tanesinde en zayıf alanın oldu.
            </p>
          </div>
          {recurringDrill && (
            <form action={startSession}>
              <input type="hidden" name="case_id" value={recurringDrill.id} />
              <input type="hidden" name="mode" value="text" />
              <input type="hidden" name="kind" value="drill" />
              <input type="hidden" name="interview_style" value="training" />
              <Button type="submit" variant="secondary">
                Bu beceriyi çalış →
              </Button>
            </form>
          )}
        </Card>
      )}

      {currentReadiness !== null && (
        <Card className="mt-6">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-400">
            Interview Readiness
          </p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <p className="text-5xl font-semibold tracking-tight text-brand-900">
                {currentReadiness}
                <span className="text-lg font-normal text-brand-400"> / 100</span>
              </p>
              {previousReadiness !== null && (
                <p className="mt-1 text-sm text-brand-600">
                  Önceki: {previousReadiness} {currentReadiness >= previousReadiness ? "↑" : "↓"}
                </p>
              )}
            </div>
            <p className="text-sm text-brand-500">
              Hedef: <strong className="text-brand-900">{readinessTarget}</strong>
            </p>
          </div>
          <div className="mt-3 h-1.5 rounded-full bg-brand-100">
            <div
              className="h-1.5 rounded-full bg-brand-500"
              style={{ width: `${Math.min(100, (currentReadiness / readinessTarget) * 100)}%` }}
            />
          </div>
          {weakest && (
            <p className="mt-3 text-sm text-brand-600">
              85&apos;e ulaşmak için: <strong className="text-brand-900">{weakest.label}</strong>{" "}
              üzerine 1-2 case daha pratik et.
            </p>
          )}
        </Card>
      )}

      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-4">
        <Card>
          <p className="text-sm text-brand-600">Tamamlanan case</p>
          <p className="mt-1 text-3xl font-semibold text-brand-900">{completed.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-brand-600">Güçlü beceri</p>
          <p className="mt-1 text-xl font-semibold text-brand-900">{strongest ? strongest.label : "—"}</p>
        </Card>
        <Card>
          <p className="text-sm text-brand-600">Güncel seri</p>
          <p className="mt-1 text-3xl font-semibold text-brand-900">
            {streak > 0 ? `${streak} gün` : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-brand-600">Toplam oturum</p>
          <p className="mt-1 text-3xl font-semibold text-brand-900">{sessions?.length ?? 0}</p>
        </Card>
      </div>

      {completed.length > 0 && (
        <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
          <Card>
            <p className="text-sm text-brand-600">Zaman içinde hazırlık skoru</p>
            <Sparkline values={readinessHistory} />
          </Card>
          <Card>
            <p className="text-sm text-brand-600">Beceri dağılımı</p>
            <div className="mt-4 flex flex-col gap-3">
              {skillAverages.map((s) => (
                <div key={s.key}>
                  <div className="flex justify-between text-xs text-brand-600">
                    <span>
                      {s.label}
                      {strongest && s.key === strongest.key && (
                        <span className="ml-1 text-success">· en güçlü</span>
                      )}
                      {weakest && s.key === weakest.key && weakest.value !== strongest?.value && (
                        <span className="ml-1 text-warning">· gelişim alanı</span>
                      )}
                    </span>
                    <span>{s.value}%</span>
                  </div>
                  <div className="mt-1 h-1.5 rounded-full bg-brand-100">
                    <div className="h-1.5 rounded-full bg-brand-500" style={{ width: `${s.value}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      <h2 className="mt-10 mb-3 text-lg font-medium text-brand-900">Geçmiş oturumlar</h2>
      <div className="flex flex-col gap-3">
        {(sessions ?? []).length === 0 && (
          <Card>
            <p className="text-sm text-brand-600">
              Henüz bir mülakat yapmadın.{" "}
              <a href="/cases" className="font-medium text-brand-700 underline">
                İlk case&apos;ini seç
              </a>
              .
            </p>
          </Card>
        )}
        {recentSessions.map((s: SessionRow & { cases: Pick<CaseRow, "title" | "industry">; feedback: FeedbackRow | null }) => (
          <Card key={s.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-brand-900">{s.cases?.title}</p>
              <p className="text-sm text-brand-600">
                {s.cases?.industry} · {new Date(s.started_at).toLocaleDateString("tr-TR")} ·{" "}
                {s.mode === "voice" ? "Sesli" : "Yazılı"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {s.status === "completed" && s.feedback ? (
                <Badge>{s.feedback.overall_score}/100</Badge>
              ) : (
                <Badge>Devam ediyor</Badge>
              )}
              <LinkButton
                href={s.status === "completed" ? `/interview/${s.id}/feedback` : `/interview/${s.id}`}
                variant="secondary"
              >
                {s.status === "completed" ? "Raporu gör" : "Devam et"}
              </LinkButton>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
