import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAI, CHAT_MODEL } from "@/lib/ai/openai";
import { buildFeedbackPrompt } from "@/lib/ai/interview";

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
    .select("role, content")
    .eq("session_id", sessionId)
    .order("created_at", { ascending: true });

  const transcript = (messages ?? [])
    .map((m) => `${m.role === "user" ? "Aday" : "Mülakatçı"}: ${m.content}`)
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
    })
    .select("*")
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json({ feedback });
}
