"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { FREE_SESSION_LIMIT, isProActive } from "@/lib/iyzico";

export async function startSession(formData: FormData) {
  const caseId = String(formData.get("case_id"));
  const mode = String(formData.get("mode") ?? "text") as "text" | "voice";
  const kind = String(formData.get("kind") ?? "practice") as "practice" | "diagnostic";
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

  if (kind !== "diagnostic" && !isProActive(profile)) {
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
