"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { PHASE_LABELS, PHASE_ORDER, type InterviewPhase } from "@/lib/ai/interview";
import { Button, Card } from "@/components/ui";

type ChatMessage = { role: "user" | "assistant"; content: string };

export function InterviewClient({
  sessionId,
  caseTitle,
  mode,
  interviewStyle,
  initialPhase,
  initialMessages,
}: {
  sessionId: string;
  caseTitle: string;
  mode: "text" | "voice";
  interviewStyle: "real" | "training";
  initialPhase: InterviewPhase;
  initialMessages: ChatMessage[];
}) {
  const router = useRouter();
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [phase, setPhase] = useState<InterviewPhase>(initialPhase);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function sendMessage(text: string) {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", content: text }]);
    setInput("");
    setIsLoading(true);

    const res = await fetch("/api/interview/respond", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId, message: text }),
    });
    const data = await res.json();
    setIsLoading(false);

    if (!res.ok) return;

    setMessages((prev) => [...prev, { role: "assistant", content: data.reply }]);
    setPhase(data.phase);

    if (mode === "voice" && data.reply) {
      const ttsRes = await fetch("/api/speech/synthesize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: data.reply }),
      });
      if (ttsRes.ok) {
        const blob = await ttsRes.blob();
        const url = URL.createObjectURL(blob);
        if (audioRef.current) {
          audioRef.current.src = url;
          audioRef.current.play().catch(() => {});
        }
      }
    }

    if (data.completed) {
      await fetch("/api/interview/feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      router.push(`/interview/${sessionId}/feedback`);
    }
  }

  async function startRecording() {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    const recorder = new MediaRecorder(stream);
    chunksRef.current = [];
    recorder.ondataavailable = (e) => chunksRef.current.push(e.data);
    recorder.onstop = async () => {
      const blob = new Blob(chunksRef.current, { type: "audio/webm" });
      stream.getTracks().forEach((t) => t.stop());
      setIsLoading(true);
      const formData = new FormData();
      formData.append("audio", blob, "recording.webm");
      const res = await fetch("/api/speech/transcribe", { method: "POST", body: formData });
      const data = await res.json();
      setIsLoading(false);
      if (res.ok && data.text) {
        sendMessage(data.text);
      }
    };
    recorder.start();
    mediaRecorderRef.current = recorder;
    setIsRecording(true);
  }

  function stopRecording() {
    mediaRecorderRef.current?.stop();
    setIsRecording(false);
  }

  async function endInterview() {
    if (isEnding) return;
    setIsEnding(true);
    await fetch("/api/interview/end", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId }),
    }).catch(() => {});
    router.push(`/interview/${sessionId}/feedback`);
  }

  const phaseIndex = PHASE_ORDER.indexOf(phase);

  return (
    <div className="mx-auto flex max-w-3xl flex-col gap-4 px-6 py-10">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <h1 className="text-xl font-semibold text-brand-900">{caseTitle}</h1>
          <div className="mt-3 flex gap-1">
            {PHASE_ORDER.slice(0, 4).map((p, i) => (
              <div
                key={p}
                className={`h-1.5 flex-1 rounded-full ${
                  i <= phaseIndex ? "bg-brand-500" : "bg-brand-100"
                }`}
                title={PHASE_LABELS[p]}
              />
            ))}
          </div>
          <div className="mt-1 flex items-center gap-2">
            <p className="text-xs text-brand-600">{PHASE_LABELS[phase]}</p>
            <span className="rounded-full bg-brand-100 px-2 py-0.5 text-[11px] font-medium text-brand-700">
              {interviewStyle === "real" ? "Gerçek mülakat" : "Antrenman modu"}
            </span>
          </div>
        </div>
        <button
          onClick={endInterview}
          disabled={isEnding}
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium text-brand-500 hover:bg-brand-50 disabled:opacity-50"
        >
          {isEnding ? "Bitiriliyor…" : "Mülakatı bitir"}
        </button>
      </div>

      <Card className="flex h-[55vh] flex-col gap-3 overflow-y-auto">
        {messages.length === 0 && (
          <p className="text-sm text-brand-500">
            Mülakatçı seni birazdan karşılayacak — mesaj göndererek başla.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`max-w-[80%] rounded-2xl px-4 py-2 text-sm ${
              m.role === "user"
                ? "self-end bg-brand-500 text-white"
                : "self-start bg-brand-50 text-brand-900"
            }`}
          >
            {m.content}
          </div>
        ))}
        {isLoading && <p className="text-xs text-brand-500">Mülakatçı yazıyor…</p>}
      </Card>

      {mode === "voice" && <audio ref={audioRef} className="hidden" />}

      {interviewStyle === "training" && (
        <button
          type="button"
          onClick={() => sendMessage("İpucu istiyorum.")}
          disabled={isLoading}
          className="self-start rounded-lg border border-border px-3 py-1.5 text-xs text-brand-600 hover:border-brand-400 disabled:opacity-50"
        >
          İpucu iste
        </button>
      )}

      <div className="flex gap-2">
        {mode === "voice" ? (
          <Button
            type="button"
            onClick={isRecording ? stopRecording : startRecording}
            variant={isRecording ? "secondary" : "primary"}
            className="w-full"
            disabled={isLoading}
          >
            {isRecording ? "Kaydı bitir ve gönder" : "Konuşmaya başla"}
          </Button>
        ) : (
          <>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage(input)}
              placeholder="Cevabını yaz…"
              className="flex-1 rounded-lg border border-border bg-surface px-3 py-2 text-sm outline-none focus:border-brand-400"
              disabled={isLoading}
            />
            <Button onClick={() => sendMessage(input)} disabled={isLoading}>
              Gönder
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
