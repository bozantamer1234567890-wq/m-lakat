import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAI, CHAT_MODEL } from "@/lib/ai/openai";
import { buildFeedbackPrompt, elapsedLabel } from "@/lib/ai/interview";

export async function POST(req: Request) {
  const { sessionId } = await req.json();
  if (!sessionId) return NextResponse.json({ error: "sessionId gerekli" }, { status: 400 });

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data: existing } = await supabase
    .from("feedback")
    .select("*")
    .eq("session_id", sessionId)
    .maybeSingle();
  if (existing) return NextResponse.json({ feedback: existing });

  const { data: session } = await supabase
    .from("sessions")
    .select("*, cases(summary)")
    .eq("id", sessionId)
    .eq("user_id", user.id)
    .single();
  if (!session) return NextResponse.json({ error: "session not found" }, { status: 404 });

  const { data: messages } = await supabase
    .from("messages")
    .select("role, content, created_at")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const transcript = (messages ?? [])
    .map((m) => {
      const label = elapsedLabel(session.started_at, m.created_at);
      return `[${label}] ${m.role === "user" ? "Aday" : "Mülakatçı"}: ${m.content}`;
    })
    .join("\n");

  const openai = getOpenAI();
  const completion = await openai.chat.completions.create({
    model: CHAT_MODEL,
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: "Sen bir case interview değerlendirme uzmanısın. Sadece istenen JSON'u döndür.",
      },
      { role: "user", content: buildFeedbackPrompt(session.cases!.summary, transcript) },
    ],
  });

  const parsed = JSON.parse(completion.choices[0]?.message?.content ?? "{}");

  const validSkills = new Set([
    "structure_score",
    "analysis_score",
    "business_judgment_score",
    "communication_score",
    "quantitative_reasoning_score",
  ]);
  const timestampedNotes = Array.isArray(parsed.timestamped_notes)
    ? parsed.timestamped_notes.filter(
        (n: unknown): n is { timestamp: string; skill: string; type: string; note: string } =>
          !!n &&
          typeof n === "object" &&
          typeof (n as { timestamp?: unknown }).timestamp === "string" &&
          validSkills.has((n as { skill?: unknown }).skill as string) &&
          typeof (n as { note?: unknown }).note === "string"
      )
    : [];

  const { data: feedback, error } = await supabase
    .from("feedback")
    .insert({
      session_id: sessionId,
      overall_score: parsed.overall_score ?? 0,
      structure_score: parsed.structure_score ?? 0,
      analysis_score: parsed.analysis_score ?? 0,
      communication_score: parsed.communication_score ?? 0,
      business_judgment_score: parsed.business_judgment_score ?? 0,
      quantitative_reasoning_score: parsed.quantitative_reasoning_score ?? 0,
      strengths: parsed.strengths ?? "",
      improvements: parsed.improvements ?? "",
      summary: parsed.summary ?? "",
      timestamped_notes: timestampedNotes,
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ feedback });
}
