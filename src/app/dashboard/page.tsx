import { createClient } from "@/lib/supabase/server";
import { Card, LinkButton, Badge, Button } from "@/components/ui";
import { openBillingPortal } from "@/app/pricing/actions";
import { FREE_SESSION_LIMIT } from "@/lib/stripe";
import type { FeedbackRow, SessionRow, CaseRow } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user!.id).single();
  const plan = (profile?.plan as "free" | "pro") ?? "free";

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*, cases(title, industry), feedback(*)")
    .eq("user_id", user!.id)
    .order("started_at", { ascending: false })
    .limit(10);

  const completed = (sessions ?? []).filter((s) => s.status === "completed");
  const avgScore = completed.length
    ? Math.round(
        completed.reduce((sum, s) => sum + (s.feedback?.overall_score ?? 0), 0) / completed.length
      )
    : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-brand-900">Panel</h1>
            <Badge>{plan === "pro" ? "Pro" : "Ücretsiz"}</Badge>
          </div>
          <p className="text-sm text-brand-600">Hoş geldin{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}.</p>
        </div>
        <div className="flex gap-2">
          {plan === "pro" ? (
            <form action={openBillingPortal}>
              <Button type="submit" variant="ghost">
                Aboneliği yönet
              </Button>
            </form>
          ) : (
            <LinkButton href="/pricing" variant="ghost">
              Pro&apos;ya geç
            </LinkButton>
          )}
          <LinkButton href="/cases">Yeni mülakat başlat</LinkButton>
        </div>
      </div>

      {plan === "free" && (sessions?.length ?? 0) >= FREE_SESSION_LIMIT && (
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

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-3">
        <Card>
          <p className="text-sm text-brand-600">Tamamlanan oturum</p>
          <p className="mt-1 text-3xl font-semibold text-brand-900">{completed.length}</p>
        </Card>
        <Card>
          <p className="text-sm text-brand-600">Ortalama skor</p>
          <p className="mt-1 text-3xl font-semibold text-brand-900">
            {avgScore !== null ? `${avgScore}/100` : "—"}
          </p>
        </Card>
        <Card>
          <p className="text-sm text-brand-600">Toplam oturum</p>
          <p className="mt-1 text-3xl font-semibold text-brand-900">{sessions?.length ?? 0}</p>
        </Card>
      </div>

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
        {(sessions ?? []).map((s: SessionRow & { cases: Pick<CaseRow, "title" | "industry">; feedback: FeedbackRow | null }) => (
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
