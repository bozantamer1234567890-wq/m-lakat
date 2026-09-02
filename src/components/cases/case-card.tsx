import Link from "next/link";
import { Card, Badge } from "@/components/ui";
import { CATEGORY_LABELS, DIFFICULTY_LABELS, SKILL_TAG_LABELS } from "@/lib/cases";
import type { CaseRow } from "@/lib/types";

export function CaseCard({
  caseItem,
  locked,
  completedScore,
}: {
  caseItem: CaseRow;
  locked: boolean;
  completedScore: number | null;
}) {
  return (
    <Card className="flex h-full flex-col justify-between">
      <div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge>{CATEGORY_LABELS[caseItem.category]}</Badge>
          <Badge>{DIFFICULTY_LABELS[caseItem.difficulty]}</Badge>
          <span className="text-xs text-brand-400">~{caseItem.estimated_minutes} dk</span>
          {locked && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-surface-muted px-2.5 py-1 text-xs font-medium text-brand-600">
              🔒 {caseItem.min_plan === "coach" ? "Coach" : "Pro"}
            </span>
          )}
        </div>

        <h3 className="mt-3 font-medium text-brand-900">{caseItem.title}</h3>
        {caseItem.subtitle && <p className="mt-0.5 text-sm text-brand-500">{caseItem.subtitle}</p>}
        <p className="mt-2 text-sm text-brand-600">{caseItem.summary}</p>

        {caseItem.skills.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {caseItem.skills.map((skill) => (
              <span key={skill} className="text-xs text-brand-400">
                {SKILL_TAG_LABELS[skill]}
                {skill !== caseItem.skills[caseItem.skills.length - 1] && " ·"}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="mt-5 flex items-center justify-between gap-3">
        {completedScore !== null ? (
          <span className="text-xs font-medium text-success">✓ Son skor: {completedScore}</span>
        ) : (
          <span />
        )}
        {locked ? (
          <Link href="/pricing" className="text-sm font-medium text-brand-700 hover:underline">
            Pro ile aç →
          </Link>
        ) : (
          <Link href={`/cases/${caseItem.id}`} className="text-sm font-medium text-brand-700 hover:underline">
            Case&apos;e başla →
          </Link>
        )}
      </div>
    </Card>
  );
}
