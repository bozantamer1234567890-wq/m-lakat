import type { createClient } from "@/lib/supabase/server";
import { SKILL_LABELS, weakestSkill, skillTagsForScoreKey } from "@/lib/cases";
import type { CaseRow, FeedbackRow, CasePlanTier } from "@/lib/types";

type Supabase = Awaited<ReturnType<typeof createClient>>;

export type CaseRecommendation = {
  case: CaseRow;
  reason: string;
  personalized: boolean;
};

function planFilterFor(canAccessPro: boolean): CasePlanTier[] {
  return canAccessPro ? ["free", "pro"] : ["free"];
}

function difficultyForScore(overallScore: number): CaseRow["difficulty"] {
  if (overallScore >= 80) return "hard";
  if (overallScore >= 55) return "medium";
  return "easy";
}

/**
 * "Bugün ne çalışmalısın?" öneri motoru (spec madde 15): gerçek performans verisi
 * varsa en zayıf beceriye göre hedefli bir case seçer; yoksa sahte bir "AI önerisi"
 * göstermek yerine yeni kullanıcıya uygun düşük seviyeli bir fallback case sunar.
 */
export async function getRecommendedCase({
  supabase,
  attemptedCaseIds,
  recentFeedback,
  canAccessPro,
}: {
  supabase: Supabase;
  attemptedCaseIds: string[];
  recentFeedback: FeedbackRow[];
  canAccessPro: boolean;
}): Promise<CaseRecommendation | null> {
  const planFilter = planFilterFor(canAccessPro);

  if (recentFeedback.length === 0) {
    const { data } = await supabase
      .from("cases")
      .select("*")
      .eq("is_published", true)
      .eq("is_diagnostic", false)
      .eq("is_drill", false)
      .eq("difficulty", "easy")
      .in("min_plan", planFilter)
      .limit(10);
    const candidates = ((data ?? []) as CaseRow[]).filter((c) => !attemptedCaseIds.includes(c.id));
    const pick = candidates[0] ?? null;
    return pick
      ? { case: pick, reason: "Başlangıç seviyesinden başlamanı öneriyoruz.", personalized: false }
      : null;
  }

  const weakest = weakestSkill(recentFeedback[0]);
  const targetTags = skillTagsForScoreKey(weakest.key);
  const difficulty = difficultyForScore(recentFeedback[0].overall_score);

  const { data } = await supabase
    .from("cases")
    .select("*")
    .eq("is_published", true)
    .eq("is_diagnostic", false)
    .eq("is_drill", false)
    .in("min_plan", planFilter)
    .overlaps("skills", targetTags);

  const candidates = ((data ?? []) as CaseRow[]).filter((c) => !attemptedCaseIds.includes(c.id));
  const pick =
    candidates.find((c) => c.difficulty === difficulty) ?? candidates[0] ?? null;

  if (!pick) return null;
  return {
    case: pick,
    reason: `Son mülakatlarında ${SKILL_LABELS[weakest.key]} alanında zorlandın. Bugün bu beceriyi geliştirecek bir case öneriyoruz.`,
    personalized: true,
  };
}

/**
 * "🎲 Bana bir case seç" (spec madde 4/19): mümkünse kişiselleştirilmiş öneriyi kullanır,
 * veri yoksa erişilebilir case'ler arasından rastgele seçer.
 */
export async function pickCaseForUser({
  supabase,
  attemptedCaseIds,
  recentFeedback,
  canAccessPro,
}: {
  supabase: Supabase;
  attemptedCaseIds: string[];
  recentFeedback: FeedbackRow[];
  canAccessPro: boolean;
}): Promise<CaseRow | null> {
  const recommended = await getRecommendedCase({ supabase, attemptedCaseIds, recentFeedback, canAccessPro });
  if (recommended) return recommended.case;

  const planFilter = planFilterFor(canAccessPro);
  const { data } = await supabase
    .from("cases")
    .select("*")
    .eq("is_published", true)
    .eq("is_diagnostic", false)
    .eq("is_drill", false)
    .in("min_plan", planFilter);

  const candidates = ((data ?? []) as CaseRow[]).filter((c) => !attemptedCaseIds.includes(c.id));
  const pool = candidates.length > 0 ? candidates : ((data ?? []) as CaseRow[]);
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}
