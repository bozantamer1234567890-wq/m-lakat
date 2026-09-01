import type { CaseCategory, FeedbackRow } from "@/lib/types";

export const CATEGORY_LABELS: Record<CaseCategory, string> = {
  "pazara-girisi": "Pazara Giriş",
  karlilik: "Karlılık",
  buyume: "Büyüme",
  "birlesme-satin-alma": "Birleşme & Satın Alma",
  fiyatlandirma: "Fiyatlandırma",
  operasyon: "Operasyon",
};

export const DIFFICULTY_LABELS: Record<"easy" | "medium" | "hard", string> = {
  easy: "Kolay",
  medium: "Orta",
  hard: "Zor",
};

export const SKILL_LABELS = {
  structure_score: "Yapı",
  analysis_score: "Analiz",
  business_judgment_score: "İş muhakemesi",
  communication_score: "İletişim",
  quantitative_reasoning_score: "Sayısal akıl yürütme",
} as const;

export type SkillKey = keyof typeof SKILL_LABELS;

const SKILL_TO_CATEGORY: Record<SkillKey, CaseCategory> = {
  structure_score: "pazara-girisi",
  analysis_score: "karlilik",
  business_judgment_score: "birlesme-satin-alma",
  communication_score: "buyume",
  quantitative_reasoning_score: "fiyatlandirma",
};

function skillEntries(feedback: FeedbackRow) {
  return (Object.keys(SKILL_LABELS) as SkillKey[]).map((key) => ({
    key,
    label: SKILL_LABELS[key],
    value: feedback[key],
  }));
}

export function weakestSkill(feedback: FeedbackRow): { key: SkillKey; label: string; value: number } {
  return skillEntries(feedback).reduce((min, cur) => (cur.value < min.value ? cur : min));
}

export function strongestSkill(feedback: FeedbackRow): { key: SkillKey; label: string; value: number } {
  return skillEntries(feedback).reduce((max, cur) => (cur.value > max.value ? cur : max));
}

export function recommendedCategoryFor(feedback: FeedbackRow): CaseCategory {
  return SKILL_TO_CATEGORY[weakestSkill(feedback).key];
}

export function categoryForSkill(key: SkillKey): CaseCategory {
  return SKILL_TO_CATEGORY[key];
}

export function skillForCategory(category: CaseCategory): SkillKey {
  const entry = (Object.entries(SKILL_TO_CATEGORY) as [SkillKey, CaseCategory][]).find(
    ([, cat]) => cat === category
  );
  return entry![0];
}

/** "Interview readiness": aday hazırlığının tek bir sayıya indirgenmiş hâli, 5 beceri skorunun ortalaması. */
export function readinessScore(feedback: FeedbackRow): number {
  const entries = skillEntries(feedback);
  return Math.round(entries.reduce((sum, e) => sum + e.value, 0) / entries.length);
}
