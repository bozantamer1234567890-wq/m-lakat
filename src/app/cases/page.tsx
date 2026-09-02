import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Button } from "@/components/ui";
import { pickCaseForMe } from "@/app/cases/actions";
import { hasCasePlanAccess, isProActive } from "@/lib/iyzico";
import {
  CATEGORY_LABELS,
  SKILL_TAG_LABELS,
  matchesDurationBucket,
  type DurationBucket,
} from "@/lib/cases";
import { getRecommendedCase } from "@/lib/case-recommendation";
import { CaseCard } from "@/components/cases/case-card";
import { CaseFilters, type CaseFilterOverrides } from "@/components/cases/case-filters";
import { CaseSearch } from "@/components/cases/case-search";
import { RecommendationCard } from "@/components/cases/recommendation-card";
import type { CaseCategory, CasePlanTier, CaseRow, CaseSkillTag, FeedbackRow } from "@/lib/types";

const PAGE_SIZE = 12;

function isCaseCategory(value: unknown): value is CaseCategory {
  return typeof value === "string" && value in CATEGORY_LABELS;
}

function isDifficulty(value: unknown): value is "easy" | "medium" | "hard" {
  return value === "easy" || value === "medium" || value === "hard";
}

function isDurationBucket(value: unknown): value is DurationBucket {
  return value === "15" || value === "25" || value === "30" || value === "45plus";
}

function isSkillTag(value: unknown): value is CaseSkillTag {
  return typeof value === "string" && value in SKILL_TAG_LABELS;
}

export const metadata = {
  title: "Case Kütüphanesi — Prova",
  description: "Gerçek mülakat senaryolarıyla pratik yap, becerilerini geliştir ve bir sonraki mülakatına hazırlan.",
};

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; difficulty?: string; duration?: string; skill?: string; q?: string; page?: string }>;
}) {
  const sp = await searchParams;
  const activeCategory = isCaseCategory(sp.category) ? sp.category : "all";
  const activeDifficulty = isDifficulty(sp.difficulty) ? sp.difficulty : "all";
  const activeDuration = isDurationBucket(sp.duration) ? sp.duration : "all";
  const activeSkill = isSkillTag(sp.skill) ? sp.skill : "all";
  const query = (sp.q ?? "").trim();
  const activePage = Math.max(1, parseInt(sp.page ?? "1", 10) || 1);

  const activeCount = [activeCategory, activeDifficulty, activeDuration, activeSkill].filter((v) => v !== "all").length;

  const buildHref = (overrides: CaseFilterOverrides) => {
    const params = new URLSearchParams();
    const category = overrides.category ?? activeCategory;
    const difficulty = overrides.difficulty ?? activeDifficulty;
    const duration = overrides.duration ?? activeDuration;
    const skill = overrides.skill ?? activeSkill;
    if (category !== "all") params.set("category", category);
    if (difficulty !== "all") params.set("difficulty", difficulty);
    if (duration !== "all") params.set("duration", duration);
    if (skill !== "all") params.set("skill", skill);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/cases?${qs}` : "/cases";
  };

  const buildPageHref = (page: number) => {
    const params = new URLSearchParams();
    if (activeCategory !== "all") params.set("category", activeCategory);
    if (activeDifficulty !== "all") params.set("difficulty", activeDifficulty);
    if (activeDuration !== "all") params.set("duration", activeDuration);
    if (activeSkill !== "all") params.set("skill", activeSkill);
    if (query) params.set("q", query);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return qs ? `/cases?${qs}` : "/cases";
  };

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let profile: { plan: "free" | "pro" | "coach"; current_period_end: string | null } | null = null;
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("plan, current_period_end")
      .eq("id", user.id)
      .single();
    profile = data;
  }
  const canAccessPro = isProActive(profile);

  const { data: allCases } = await supabase
    .from("cases")
    .select("*")
    .eq("is_published", true)
    .eq("is_diagnostic", false)
    .eq("is_drill", false)
    .order("created_at", { ascending: false });
  const cases = (allCases ?? []) as CaseRow[];

  let attemptedCaseIds: string[] = [];
  let completedScoreByCase: Record<string, number> = {};
  let recentFeedback: FeedbackRow[] = [];

  if (user) {
    const { data: sessions } = await supabase
      .from("sessions")
      .select("case_id, status, feedback(*)")
      .eq("user_id", user.id)
      .order("started_at", { ascending: false })
      .limit(50);

    attemptedCaseIds = (sessions ?? []).map((s) => s.case_id);
    const completed = (sessions ?? []).filter((s) => s.status === "completed" && s.feedback) as unknown as {
      case_id: string;
      feedback: FeedbackRow;
    }[];
    completedScoreByCase = completed.reduce<Record<string, number>>((acc, s) => {
      if (!(s.case_id in acc)) acc[s.case_id] = s.feedback.overall_score;
      return acc;
    }, {});
    recentFeedback = completed.slice(0, 5).map((s) => s.feedback);
  }

  const recommendation = await getRecommendedCase({
    supabase,
    attemptedCaseIds,
    recentFeedback,
    canAccessPro,
  });

  const search = query.toLocaleLowerCase("tr");
  const filtered = cases.filter((c) => {
    if (activeCategory !== "all" && c.category !== activeCategory) return false;
    if (activeDifficulty !== "all" && c.difficulty !== activeDifficulty) return false;
    if (activeDuration !== "all" && !matchesDurationBucket(c.estimated_minutes, activeDuration)) return false;
    if (activeSkill !== "all" && !c.skills.includes(activeSkill)) return false;
    if (search) {
      const haystack = [
        c.title,
        c.industry,
        CATEGORY_LABELS[c.category],
        ...c.skills.map((s) => SKILL_TAG_LABELS[s]),
      ]
        .join(" ")
        .toLocaleLowerCase("tr");
      if (!haystack.includes(search)) return false;
    }
    return true;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const page = Math.min(activePage, totalPages);
  const pageItems = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-brand-900">Case Kütüphanesi</h1>
      <p className="mt-1 text-sm text-brand-600">
        Gerçek mülakat senaryolarıyla pratik yap, becerilerini geliştir ve bir sonraki mülakatına hazırlan.
      </p>

      <div className="mt-6">
        {recommendation ? (
          <RecommendationCard recommendation={recommendation} />
        ) : (
          <Card>
            <p className="text-sm text-brand-600">
              Şu an için önerebileceğimiz bir case bulamadık — aşağıdaki kütüphaneden seçebilirsin.
            </p>
          </Card>
        )}
      </div>

      <form action={pickCaseForMe} className="mt-4">
        <Button type="submit" variant="secondary">
          🎲 Bana bir case seç
        </Button>
      </form>

      <div className="mt-8">
        <CaseSearch query={query} category={activeCategory} difficulty={activeDifficulty} duration={activeDuration} skill={activeSkill} />
      </div>

      <CaseFilters
        activeCategory={activeCategory}
        activeDifficulty={activeDifficulty}
        activeDuration={activeDuration}
        activeSkill={activeSkill}
        buildHref={buildHref}
        activeCount={activeCount}
      />

      <div id="case-library" className="mt-8 flex items-center justify-between">
        <h2 className="text-lg font-medium text-brand-900">Case Kütüphanesi</h2>
        <p className="text-sm text-brand-500">{filtered.length} case</p>
      </div>

      {pageItems.length === 0 ? (
        <Card className="mt-4">
          <p className="text-sm text-brand-600">Bu kriterlere uygun bir case bulunamadı.</p>
          <Link href="/cases" className="mt-2 inline-block text-sm font-medium text-brand-700 underline">
            Filtreleri temizle
          </Link>
        </Card>
      ) : (
        <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {pageItems.map((c) => (
            <CaseCard
              key={c.id}
              caseItem={c}
              locked={!hasCasePlanAccess(profile, c.min_plan as CasePlanTier)}
              completedScore={completedScoreByCase[c.id] ?? null}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <Link
              key={p}
              href={buildPageHref(p)}
              className={`inline-flex h-8 w-8 items-center justify-center rounded-full text-sm ${
                p === page ? "bg-brand-500 text-white" : "text-brand-600 hover:bg-brand-50"
              }`}
            >
              {p}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
