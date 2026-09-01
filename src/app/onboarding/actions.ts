"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function completeOnboarding(formData: FormData) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const targetFirm = String(formData.get("target_firm") ?? "").trim() || null;
  const interviewDate = String(formData.get("interview_date") ?? "").trim() || null;
  const experienceLevel = String(formData.get("experience_level") ?? "") || null;
  const dailyPracticeMinutes = Number(formData.get("daily_practice_minutes")) || null;
  const preferredMode = String(formData.get("preferred_mode") ?? "") || null;

  await supabase
    .from("profiles")
    .update({
      target_firm: targetFirm,
      interview_date: interviewDate,
      experience_level: experienceLevel,
      daily_practice_minutes: dailyPracticeMinutes,
      preferred_mode: preferredMode,
      onboarding_completed_at: new Date().toISOString(),
    })
    .eq("id", user.id);

  redirect("/dashboard");
}

export async function skipOnboarding() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  await supabase
    .from("profiles")
    .update({ onboarding_completed_at: new Date().toISOString() })
    .eq("id", user.id);

  redirect("/dashboard");
}
