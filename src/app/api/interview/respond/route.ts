import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAI, CHAT_MODEL } from "@/lib/ai/openai";
import { buildSystemPrompt, candidateLevelFromAverage, type InterviewPhase } from "@/lib/ai/interview";

// Deterministic phase schedule based on how many user turns have happened so far.
const PHASE_SCHEDULE: { upTo: number; phase: InterviewPhase }[] = [
  { upTo: 1, phase: "opening" },
  { upTo: 4, phase: "structure" },
  { upTo: 7, phase: "analysis" },
  { upTo: 9, phase: "recommendation" },
  { upTo: Infinity, phase: "completed" },
];

// Diagnostic sessions are a ~5-minute readiness check, so they move through
// the same phases in far fewer turns.
const DIAGNOSTIC_PHASE_SCHEDULE: { upTo: number; phase: InterviewPhase }[] = [
  { upTo: 1, phase: "opening" },
  { upTo: 2, phase: "structure" },
  { upTo: 3, phase: "analysis" },
  { upTo: 4, phase: "recommendation" },
  { upTo: Infinity, phase: "completed" },
];

function phaseForTurn(userTurnNumber: number, kind: "practice" | "diagnostic"): InterviewPhase {
  const schedule = kind === "diagnostic" ? DIAGNOSTIC_PHASE_SCHEDULE : PHASE_SCHEDULE;
  return schedule.find((s) => userTurnNumber <= s.upTo)!.phase;
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
  const phase = phaseForTurn(priorUserTurns + 1, session.kind);

  await supabase.from("messages").insert({ session_id: sessionId, role: "user", content: message });

  // Adaptif zorluk: adayın son tamamlanmış oturumlarındaki ortalama skoruna göre
  // takip sorularının sertliğini ayarla (gerçek mülakat modunda daha belirgin hissedilir).
  const { data: recentSessions } = await supabase
    .from("sessions")
    .select("feedback(overall_score)")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .neq("id", sessionId)
    .order("started_at", { ascending: false })
    .limit(5);
  const recentScores = (recentSessions ?? [])
    .flatMap((s) => (Array.isArray(s.feedback) ? s.feedback : [s.feedback]))
    .map((f) => f?.overall_score)
    .filter((v): v is number => typeof v === "number");
  const avgRecentScore = recentScores.length
    ? recentScores.reduce((a, b) => a + b, 0) / recentScores.length
    : null;
  const level = candidateLevelFromAverage(avgRecentScore);

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    messages: [
      { role: "system", content: buildSystemPrompt(session.cases!.prompt, phase, session.interview_style, level) },
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
