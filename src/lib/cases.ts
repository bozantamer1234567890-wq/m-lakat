import type { CaseCategory, CasePlanTier, CaseSkillTag, FeedbackRow } from "@/lib/types";

export const CATEGORY_LABELS: Record<CaseCategory, string> = {
  "pazara-girisi": "Pazara Giriş",
  karlilik: "Karlılık",
  buyume: "Büyüme",
  "birlesme-satin-alma": "Birleşme & Satın Alma",
  fiyatlandirma: "Fiyatlandırma",
  operasyon: "Operasyon",
  "pazar-buyuklugu": "Pazar Büyüklüğü",
  "is-modeli": "İş Modeli",
};

export const SKILL_TAG_LABELS: Record<CaseSkillTag, string> = {
  structuring: "Yapılandırma",
  quantitative: "Sayısal Analiz",
  hypothesis: "Hipotez Kurma",
  communication: "İletişim",
  business_judgment: "İş Muhakemesi",
  market_sizing: "Pazar Büyüklüğü Tahmini",
};

export const PLAN_TIER_LABELS: Record<CasePlanTier, string> = {
  free: "Ücretsiz",
  pro: "Pro",
  coach: "Coach",
};

export const DIFFICULTY_LABELS: Record<"easy" | "medium" | "hard", string> = {
  easy: "Kolay",
  medium: "Orta",
  hard: "Zor",
};

export type DurationBucket = "15" | "25" | "30" | "45plus";

export const DURATION_BUCKET_LABELS: Record<DurationBucket, string> = {
  "15": "15 dk",
  "25": "25 dk",
  "30": "30 dk",
  "45plus": "45+ dk",
};

export function matchesDurationBucket(minutes: number, bucket: DurationBucket): boolean {
  if (bucket === "15") return minutes <= 15;
  if (bucket === "25") return minutes > 15 && minutes <= 25;
  if (bucket === "30") return minutes > 25 && minutes <= 30;
  return minutes > 30;
}

export const SKILL_LABELS = {
  structure_score: "Yapı",
  analysis_score: "Analiz",
  business_judgment_score: "İş muhakemesi",
  communication_score: "İletişim",
  quantitative_reasoning_score: "Sayısal akıl yürütme",
} as const;

export type SkillKey = keyof typeof SKILL_LABELS;

/** Case-level skill tags (madde 10/15) eşlenir: her case birden fazla beceriyi işaretleyebilir,
 * ama öneri motoru hâlâ tek bir feedback skoruna (SkillKey) göre çalışır. */
export const SKILL_TAG_TO_SCORE_KEY: Record<CaseSkillTag, SkillKey> = {
  structuring: "structure_score",
  quantitative: "quantitative_reasoning_score",
  hypothesis: "analysis_score",
  communication: "communication_score",
  business_judgment: "business_judgment_score",
  market_sizing: "quantitative_reasoning_score",
};

export function skillTagsForScoreKey(key: SkillKey): CaseSkillTag[] {
  return (Object.entries(SKILL_TAG_TO_SCORE_KEY) as [CaseSkillTag, SkillKey][])
    .filter(([, scoreKey]) => scoreKey === key)
    .map(([tag]) => tag);
}

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
