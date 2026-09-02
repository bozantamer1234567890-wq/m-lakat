import Link from "next/link";
import {
  CATEGORY_LABELS,
  DIFFICULTY_LABELS,
  DURATION_BUCKET_LABELS,
  SKILL_TAG_LABELS,
  type DurationBucket,
} from "@/lib/cases";
import type { CaseCategory, CaseSkillTag } from "@/lib/types";

export type CaseFilterOverrides = Partial<{
  category: string;
  difficulty: string;
  duration: string;
  skill: string;
}>;

const CATEGORY_ORDER: CaseCategory[] = [
  "karlilik",
  "pazara-girisi",
  "buyume",
  "birlesme-satin-alma",
  "fiyatlandirma",
  "pazar-buyuklugu",
  "operasyon",
  "is-modeli",
];

const DIFFICULTY_ORDER: Array<"easy" | "medium" | "hard"> = ["easy", "medium", "hard"];
const DURATION_ORDER: DurationBucket[] = ["15", "25", "30", "45plus"];
const SKILL_ORDER: CaseSkillTag[] = [
  "structuring",
  "quantitative",
  "hypothesis",
  "communication",
  "business_judgment",
  "market_sizing",
];

function Pill({ href, active, children }: { href: string; active: boolean; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className={`rounded-full border px-3 py-1 text-xs transition-colors ${
        active ? "border-brand-400 bg-brand-100 text-brand-900" : "border-border text-brand-500 hover:border-brand-400"
      }`}
    >
      {children}
    </Link>
  );
}

function FilterGroups({
  activeCategory,
  activeDifficulty,
  activeDuration,
  activeSkill,
  buildHref,
}: {
  activeCategory: CaseCategory | "all";
  activeDifficulty: "easy" | "medium" | "hard" | "all";
  activeDuration: DurationBucket | "all";
  activeSkill: CaseSkillTag | "all";
  buildHref: (overrides: CaseFilterOverrides) => string;
}) {
  return (
    <div className="flex flex-col gap-3">
      <div>
        <p className="mb-1.5 text-xs font-medium text-brand-400">Kategori</p>
        <div className="flex flex-wrap gap-1.5">
          <Pill href={buildHref({ category: "all" })} active={activeCategory === "all"}>
            Tümü
          </Pill>
          {CATEGORY_ORDER.map((c) => (
            <Pill key={c} href={buildHref({ category: c })} active={activeCategory === c}>
              {CATEGORY_LABELS[c]}
            </Pill>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-brand-400">Zorluk</p>
        <div className="flex flex-wrap gap-1.5">
          <Pill href={buildHref({ difficulty: "all" })} active={activeDifficulty === "all"}>
            Tüm seviyeler
          </Pill>
          {DIFFICULTY_ORDER.map((d) => (
            <Pill key={d} href={buildHref({ difficulty: d })} active={activeDifficulty === d}>
              {DIFFICULTY_LABELS[d]}
            </Pill>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-brand-400">Süre</p>
        <div className="flex flex-wrap gap-1.5">
          <Pill href={buildHref({ duration: "all" })} active={activeDuration === "all"}>
            Tüm süreler
          </Pill>
          {DURATION_ORDER.map((d) => (
            <Pill key={d} href={buildHref({ duration: d })} active={activeDuration === d}>
              {DURATION_BUCKET_LABELS[d]}
            </Pill>
          ))}
        </div>
      </div>
      <div>
        <p className="mb-1.5 text-xs font-medium text-brand-400">Beceri</p>
        <div className="flex flex-wrap gap-1.5">
          <Pill href={buildHref({ skill: "all" })} active={activeSkill === "all"}>
            Tüm beceriler
          </Pill>
          {SKILL_ORDER.map((s) => (
            <Pill key={s} href={buildHref({ skill: s })} active={activeSkill === s}>
              {SKILL_TAG_LABELS[s]}
            </Pill>
          ))}
        </div>
      </div>
    </div>
  );
}

export function CaseFilters(props: {
  activeCategory: CaseCategory | "all";
  activeDifficulty: "easy" | "medium" | "hard" | "all";
  activeDuration: DurationBucket | "all";
  activeSkill: CaseSkillTag | "all";
  buildHref: (overrides: CaseFilterOverrides) => string;
  activeCount: number;
}) {
  return (
    <div className="mt-6">
      {/* Desktop: her zaman görünür yatay filtreler */}
      <div className="hidden sm:block">
        <FilterGroups {...props} />
      </div>

      {/* Mobil: çekmece (drawer) davranışı için native <details> */}
      <details className="sm:hidden">
        <summary className="inline-flex cursor-pointer list-none items-center gap-1.5 rounded-full border border-border px-3.5 py-1.5 text-sm text-brand-700">
          Filtrele{props.activeCount > 0 ? ` (${props.activeCount})` : ""}
        </summary>
        <div className="mt-3 rounded-xl border border-border bg-surface p-4">
          <FilterGroups {...props} />
        </div>
      </details>
    </div>
  );
}
