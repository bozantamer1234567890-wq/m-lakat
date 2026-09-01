import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, Button } from "@/components/ui";
import { startSession } from "@/app/cases/actions";

export default async function DiagnosticPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { count: diagnosticDone } = await supabase
    .from("sessions")
    .select("*", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("kind", "diagnostic")
    .eq("status", "completed");
  if ((diagnosticDone ?? 0) > 0) redirect("/dashboard");

  const { data: diagnosticCase } = await supabase
    .from("cases")
    .select("*")
    .eq("is_diagnostic", true)
    .single();

  if (!diagnosticCase) redirect("/dashboard");

  return (
    <div className="mx-auto max-w-lg px-6 py-16 text-center">
      <Badge>Hoş geldin</Badge>
      <h1 className="mt-4 text-3xl font-semibold tracking-tight text-brand-900">
        Hazırlık seviyeni ölçelim.
      </h1>
      <p className="mt-3 text-brand-600">
        5 dakikalık kısa bir diagnostic mülakat ile şu an nerede olduğunu görelim.
      </p>

      <Card className="mt-8 text-left">
        <p className="text-xs font-medium uppercase tracking-wide text-brand-400">Ölçülen beceriler</p>
        <ul className="mt-3 grid grid-cols-2 gap-2 text-sm text-brand-700">
          <li>• Yapı</li>
          <li>• Sayısal akıl yürütme</li>
          <li>• İş muhakemesi</li>
          <li>• İletişim</li>
          <li>• Analiz</li>
        </ul>

        <form action={startSession} className="mt-6">
          <input type="hidden" name="case_id" value={diagnosticCase.id} />
          <input type="hidden" name="mode" value="text" />
          <input type="hidden" name="kind" value="diagnostic" />
          <input type="hidden" name="interview_style" value="real" />
          <Button type="submit" className="w-full">
            Diagnostic&apos;e başla →
          </Button>
        </form>
      </Card>

      <p className="mt-4 text-xs text-brand-400">Bu, ücretsiz oturum hakkından düşmez.</p>
    </div>
  );
}
