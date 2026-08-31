import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getOpenAI, STT_MODEL } from "@/lib/ai/openai";

export async function POST(req: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const formData = await req.formData();
  const audio = formData.get("audio");
  if (!(audio instanceof File)) {
    return NextResponse.json({ error: "audio dosyası gerekli" }, { status: 400 });
  }

  const openai = getOpenAI();
  const transcription = await openai.audio.transcriptions.create({
    file: audio,
    model: STT_MODEL,
    language: "tr",
  });

  return NextResponse.json({ text: transcription.text });
}
