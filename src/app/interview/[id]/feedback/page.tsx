import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, LinkButton, Badge } from "@/components/ui";

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
            <ScoreBar label="İletişim" value={feedback.communication_score} />
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
