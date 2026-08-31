import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAI, CHAT_MODEL } from "@/lib/ai/openai";
import { buildSystemPrompt, type InterviewPhase } from "@/lib/ai/interview";

// Deterministic phase schedule based on how many user turns have happened so far.
const PHASE_SCHEDULE: { upTo: number; phase: InterviewPhase }[] = [
  { upTo: 1, phase: "opening" },
  { upTo: 4, phase: "structure" },
  { upTo: 7, phase: "analysis" },
  { upTo: 9, phase: "recommendation" },
  { upTo: Infinity, phase: "completed" },
];

function phaseForTurn(userTurnNumber: number): InterviewPhase {
  return PHASE_SCHEDULE.find((s) => userTurnNumber <= s.upTo)!.phase;
}

export async function POST(req: Request) {
  const { sessionId, message } = await req.json();
  if (!sessionId || !message) {
    return NextResponse.json({ error: "sessionId ve message gerekli" }, { status: 400 });
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: session } = await supabase
    .from("sessions")
    .select("*, cases(prompt, title)")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();

  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  const { data: history } = await supabase
    .from("messages")
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const priorUserTurns = (history ?? []).filter((m) => m.role === "user").length;
  const phase = phaseForTurn(priorUserTurns + 1);

  await supabase.from("messages").insert({ session_id: sessionId, role: "user", content: message });

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt(session.cases!.prompt, phase) },
      ...(history ?? []).map((m) => ({ role: m.role as "user" | "assistant", content: m.content })),
      { role: "user", content: message },
    ],
  });

  const reply = completion.choices[0]?.message?.content ?? "";

  await supabase.from("messages").insert({ session_id: sessionId, role: "assistant", content: reply });

  const isCompleted = phase === "completed";
  await supabase
    .from("sessions")
    .update({
      phase,
      status: isCompleted ? "completed" : "in_progress",
      completed_at: isCompleted ? new Date().toISOString() : null,
    })
    .eq("id", sessionId);

  return NextResponse.json({ reply, phase, completed: isCompleted });
}
