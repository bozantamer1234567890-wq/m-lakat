import { Card, Badge, LinkButton } from "@/components/ui";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/cases";
import type { CaseRecommendation } from "@/lib/case-recommendation";

export function RecommendationCard({ recommendation }: { recommendation: CaseRecommendation }) {
  const { case: caseItem, reason, personalized } = recommendation;

  return (
    <Card className="border-brand-500">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-500">
        {personalized ? "🎯 Sana özel öneri" : "Bugün için önerimiz"}
      </p>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>{CATEGORY_LABELS[caseItem.category]}</Badge>
            <Badge>{DIFFICULTY_LABELS[caseItem.difficulty]}</Badge>
            <span className="text-xs text-brand-400">~{caseItem.estimated_minutes} dk</span>
          </div>
          <h3 className="mt-2 font-medium text-brand-900">{caseItem.title}</h3>
          <p className="mt-1 text-sm text-brand-600">{reason}</p>
        </div>
        <LinkButton href={`/cases/${caseItem.id}`}>Case&apos;e başla →</LinkButton>
      </div>
    </Card>
  );
}
