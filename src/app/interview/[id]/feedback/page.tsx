import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, LinkButton, Badge, Button } from "@/components/ui";
import { startSession } from "@/app/cases/actions";
import { CATEGORY_LABELS, DIFFICULTY_LABELS, recommendedCategoryFor, weakestSkill } from "@/lib/cases";
import type { CaseRow } from "@/lib/types";

function ScoreBar({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="flex justify-between text-sm text-brand-700">
        <span>{label}</span>
        <span className="font-medium">{value}/100</span>
      </div>
      <div className="mt-1 h-2 rounded-full bg-brand-100">
        <div className="h-2 rounded-full bg-brand-500" style={{ width: `${value}%` }} />
      </div>
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
    .select("*, cases(title)")
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
            <ScoreBar label="Yapı" value={feedback.structure_score} />
            <ScoreBar label="Analiz" value={feedback.analysis_score} />
            <ScoreBar label="İş muhakemesi" value={feedback.business_judgment_score} />
            <ScoreBar label="İletişim" value={feedback.communication_score} />
            <ScoreBar label="Sayısal akıl yürütme" value={feedback.quantitative_reasoning_score} />
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
