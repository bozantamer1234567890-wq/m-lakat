"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export async function startSession(formData: FormData) {
  const caseId = String(formData.get("case_id"));
  const mode = String(formData.get("mode") ?? "text") as "text" | "voice";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data, error } = await supabase
    .from("sessions")
    .insert({ user_id: user.id, case_id: caseId, mode })
    .select("id")
    .single();

  if (error || !data) {
    redirect(`/cases?error=${encodeURIComponent(error?.message ?? "Oturum oluşturulamadı")}`);
  }

  redirect(`/interview/${data.id}`);
}
