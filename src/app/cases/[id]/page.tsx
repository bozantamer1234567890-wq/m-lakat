import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, Button, LinkButton } from "@/components/ui";
import { startSession } from "@/app/cases/actions";
import { hasCasePlanAccess } from "@/lib/iyzico";
import { CATEGORY_LABELS, DIFFICULTY_LABELS, SKILL_TAG_LABELS } from "@/lib/cases";
import type { CaseRow, CasePlanTier } from "@/lib/types";

export default async function CaseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  const { data: caseItem } = await supabase
    .from("cases")
    .select("*")
    .eq("id", id)
    .eq("is_published", true)
    .eq("is_diagnostic", false)
    .eq("is_drill", false)
    .maybeSingle<CaseRow>();

  if (!caseItem) notFound();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  let locked = caseItem.min_plan !== "free";
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, current_period_end")
      .eq("id", user.id)
      .single();
    locked = !hasCasePlanAccess(profile, caseItem.min_plan as CasePlanTier);
  }

  return (
    <div className="mx-auto max-w-2xl px-6 py-10">
      <Link href="/cases" className="text-sm text-brand-500 hover:underline">
        ← Case Kütüphanesi
      </Link>

      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Badge>{CATEGORY_LABELS[caseItem.category]}</Badge>
        <Badge>{DIFFICULTY_LABELS[caseItem.difficulty]}</Badge>
        <span className="text-xs text-brand-400">~{caseItem.estimated_minutes} dk</span>
        <span className="text-xs text-brand-400">· {caseItem.industry}</span>
      </div>

      <h1 className="mt-3 text-2xl font-semibold text-brand-900">{caseItem.title}</h1>
      {caseItem.subtitle && <p className="mt-1 text-brand-600">{caseItem.subtitle}</p>}
      <p className="mt-4 text-sm leading-relaxed text-brand-700">{caseItem.summary}</p>

      {caseItem.skills.length > 0 && (
        <div className="mt-5">
          <p className="text-xs font-medium uppercase tracking-wide text-brand-400">Bu case hangi becerileri ölçer?</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {caseItem.skills.map((skill) => (
              <Badge key={skill}>{SKILL_TAG_LABELS[skill]}</Badge>
            ))}
          </div>
        </div>
      )}

      <Card className="mt-8">
        {locked ? (
          <div className="text-center">
            <p className="text-sm text-brand-700">
              Bu case <strong>{caseItem.min_plan === "coach" ? "Coach" : "Pro"}</strong> planına dahil.
            </p>
            <LinkButton href="/pricing" className="mt-3">
              {caseItem.min_plan === "coach" ? "Coach ile aç" : "Pro ile aç"}
            </LinkButton>
          </div>
        ) : (
          <form action={startSession} className="flex flex-col gap-4">
            <input type="hidden" name="case_id" value={caseItem.id} />
            <fieldset className="flex gap-4 text-sm text-brand-600">
              <label className="flex items-center gap-1.5">
                <input type="radio" name="interview_style" value="real" defaultChecked />
                Gerçek mülakat
              </label>
              <label className="flex items-center gap-1.5">
                <input type="radio" name="interview_style" value="training" />
                Antrenman (ipucu alabilirsin)
              </label>
            </fieldset>
            <div className="flex gap-2">
              <Button type="submit" name="mode" value="text" variant="secondary" className="flex-1">
                Yazılı başla
              </Button>
              <Button type="submit" name="mode" value="voice" className="flex-1">
                Sesli başla
              </Button>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}
