"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FREE_SESSION_LIMIT, isProActive, hasCasePlanAccess } from "@/lib/iyzico";
import { pickCaseForUser } from "@/lib/case-recommendation";
import type { CasePlanTier, FeedbackRow } from "@/lib/types";

export async function startSession(formData: FormData) {
  const caseId = String(formData.get("case_id"));
  const mode = String(formData.get("mode") ?? "text") as "text" | "voice";
  const kind = String(formData.get("kind") ?? "practice") as "practice" | "diagnostic" | "drill";
  const interviewStyle = String(formData.get("interview_style") ?? "real") as "real" | "training";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, current_period_end")
    .eq("id", user.id)
    .single();

  const { data: caseRow } = await supabase.from("cases").select("min_plan").eq("id", caseId).single();
  if (caseRow && !hasCasePlanAccess(profile, caseRow.min_plan as CasePlanTier)) {
    redirect("/pricing");
  }

  if (kind === "practice" && !isProActive(profile)) {
    const { count } = await supabase
      .from("sessions")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .eq("kind", "practice");
    if ((count ?? 0) >= FREE_SESSION_LIMIT) {
      redirect("/pricing");
    }
  }

  const { data, error } = await supabase
    .from("sessions")
    .insert({ user_id: user.id, case_id: caseId, mode, kind, interview_style: interviewStyle })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/cases?error=${encodeURIComponent(error?.message ?? "Oturum oluşturulamadı")}`);
  }

  redirect(`/interview/${data.id}`);
}

/** "🎲 Bana bir case seç" — mümkünse kişiselleştirilmiş öneriyi kullanır, yoksa erişilebilir case'ler arasından rastgele seçer. */
export async function pickCaseForMe() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("plan, current_period_end")
    .eq("id", user.id)
    .single();

  const { data: sessions } = await supabase
    .from("sessions")
    .select("case_id, feedback(*)")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("started_at", { ascending: false })
    .limit(5);

  const attemptedCaseIds = (sessions ?? []).map((s) => s.case_id);
  const recentFeedback = (sessions ?? [])
    .map((s) => s.feedback as unknown as FeedbackRow | null)
    .filter((f): f is FeedbackRow => f !== null);

  const picked = await pickCaseForUser({
    supabase,
    attemptedCaseIds,
    recentFeedback,
    canAccessPro: isProActive(profile),
  });

  if (!picked) redirect("/cases");
  redirect(`/cases/${picked.id}`);
}
