import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { InterviewClient } from "./interview-client";

export default async function InterviewPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: session } = await supabase
    .from("sessions")
    .select("*, cases(title, summary)")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!session) redirect("/cases");

  if (session.status === "completed") {
    redirect(`/interview/${id}/feedback`);
  }

  const { data: messages } = await supabase
    .from("messages")
    .select("*")
    .eq("session_id", id)
    .order("created_at", { ascending: true });

  return (
    <InterviewClient
      sessionId={id}
      caseTitle={session.cases!.title}
      mode={session.mode as "text" | "voice"}
      interviewStyle={session.interview_style}
      kind={session.kind}
      initialPhase={session.phase}
      initialMessages={(messages ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content }))}
    />
  );
}
