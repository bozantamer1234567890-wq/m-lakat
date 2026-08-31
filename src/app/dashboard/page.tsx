import { createClient } from "@/lib/supabase/server";
import { Card, LinkButton, Badge } from "@/components/ui";
import type { FeedbackRow, SessionRow, CaseRow } from "@/lib/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("*, cases(title, industry), feedback(*)")
    .eq("user_id", user!.id)
    .order("started_at", { ascending: false })
    .limit(10);

  const completed = (sessions ?? []).filter((s) => s.status === "completed");
  const avgScore = completed.length
    ? Math.round(
        completed.reduce(
          (sum, s) => sum + (Array.isArray(s.feedback) ? s.feedback[0]?.overall_score ?? 0 : 0),
          0
        ) / completed.length
      )
    : null;

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-brand-900">Panel</h1>
          <p className="text-sm text-brand-600">Hoş geldin{user?.user_metadata?.full_name ? `, ${user.user_metadata.full_name}` : ""}.</p>
        </div>
        <LinkButton href="/cases">Yeni mülakat başlat</LinkButton>
      </div>

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
        {(sessions ?? []).map((s: SessionRow & { cases: Pick<CaseRow, "title" | "industry">; feedback: FeedbackRow[] }) => (
          <Card key={s.id} className="flex items-center justify-between">
            <div>
              <p className="font-medium text-brand-900">{s.cases?.title}</p>
              <p className="text-sm text-brand-600">
                {s.cases?.industry} · {new Date(s.started_at).toLocaleDateString("tr-TR")} ·{" "}
                {s.mode === "voice" ? "Sesli" : "Yazılı"}
              </p>
            </div>
            <div className="flex items-center gap-3">
              {s.status === "completed" && s.feedback?.[0] ? (
                <Badge>{s.feedback[0].overall_score}/100</Badge>
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
