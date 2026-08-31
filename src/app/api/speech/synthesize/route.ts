import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAI, TTS_MODEL, TTS_VOICE } from "@/lib/ai/openai";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { text } = await req.json();
  if (!text) return NextResponse.json({ error: "text gerekli" }, { status: 400 });

  const openai = getOpenAI();
  const speech = await openai.audio.speech.create({
    model: TTS_MODEL,
    voice: TTS_VOICE,
    input: text,
  });

  const buffer = Buffer.from(await speech.arrayBuffer());
  return new NextResponse(buffer, {
    headers: { "Content-Type": "audio/mpeg" },
  });
}
