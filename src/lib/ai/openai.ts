import OpenAI from "openai";

let client: OpenAI | null = null;

export function getOpenAI() {
  if (!client) {
    client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
  }
  return client;
}

export const CHAT_MODEL = "gpt-4o-mini";
export const TTS_MODEL = "tts-1";
export const TTS_VOICE = "alloy";
export const STT_MODEL = "whisper-1";
