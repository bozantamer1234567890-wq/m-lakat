"use client";

import { useState } from "react";
import { completeOnboarding, skipOnboarding } from "@/app/onboarding/actions";
import { Button, Card } from "@/components/ui";

const STEPS = ["target_firm", "interview_date", "experience_level", "daily_practice_minutes", "preferred_mode"] as const;
type Step = (typeof STEPS)[number];

const STEP_TITLES: Record<Step, string> = {
  target_firm: "Hedef firma tipi ne?",
  interview_date: "Mülakatın ne zaman?",
  experience_level: "Deneyim seviyeni nasıl tanımlarsın?",
  daily_practice_minutes: "Günde ne kadar pratik yapabilirsin?",
  preferred_mode: "Hangi modu tercih edersin?",
};

export function OnboardingWizard() {
  const [stepIndex, setStepIndex] = useState(0);
  const [values, setValues] = useState<Record<Step, string>>({
    target_firm: "",
    interview_date: "",
    experience_level: "",
    daily_practice_minutes: "30",
    preferred_mode: "text",
  });

  const step = STEPS[stepIndex];
  const isLast = stepIndex === STEPS.length - 1;

  function next() {
    setStepIndex((i) => Math.min(i + 1, STEPS.length - 1));
  }
  function back() {
    setStepIndex((i) => Math.max(i - 1, 0));
  }
  function setValue(v: string) {
    setValues((prev) => ({ ...prev, [step]: v }));
  }

  return (
    <div className="mx-auto max-w-md px-6 py-16">
      <div className="mb-6 flex gap-1">
        {STEPS.map((s, i) => (
          <div key={s} className={`h-1 flex-1 rounded-full ${i <= stepIndex ? "bg-brand-500" : "bg-brand-100"}`} />
        ))}
      </div>

      <Card>
        <p className="text-xs font-medium uppercase tracking-wide text-brand-400">
          {stepIndex + 1} / {STEPS.length}
        </p>
        <h1 className="mt-2 text-lg font-medium text-brand-900">{STEP_TITLES[step]}</h1>

        <div className="mt-5">
          {step === "target_firm" && (
            <input
              value={values.target_firm}
              onChange={(e) => setValue(e.target.value)}
              placeholder="örn. McKinsey, BCG, Bain…"
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          )}

          {step === "interview_date" && (
            <input
              type="date"
              value={values.interview_date}
              onChange={(e) => setValue(e.target.value)}
              className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none focus:border-brand-400"
            />
          )}

          {step === "experience_level" && (
            <div className="flex flex-col gap-2">
              {[
                { value: "beginner", label: "Yeni başlıyorum" },
                { value: "intermediate", label: "Birkaç pratik yaptım" },
                { value: "advanced", label: "Deneyimliyim" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue(opt.value)}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    values.experience_level === opt.value
                      ? "border-brand-500 bg-brand-50 text-brand-900"
                      : "border-border text-brand-700 hover:border-brand-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}

          {step === "daily_practice_minutes" && (
            <div className="flex flex-col gap-2">
              {["15", "30", "45", "60"].map((min) => (
                <button
                  key={min}
                  type="button"
                  onClick={() => setValue(min)}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    values.daily_practice_minutes === min
                      ? "border-brand-500 bg-brand-50 text-brand-900"
                      : "border-border text-brand-700 hover:border-brand-400"
                  }`}
                >
                  {min} dakika
                </button>
              ))}
            </div>
          )}

          {step === "preferred_mode" && (
            <div className="flex flex-col gap-2">
              {[
                { value: "text", label: "Yazılı" },
                { value: "voice", label: "Sesli" },
              ].map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setValue(opt.value)}
                  className={`rounded-lg border px-3 py-2.5 text-left text-sm transition-colors ${
                    values.preferred_mode === opt.value
                      ? "border-brand-500 bg-brand-50 text-brand-900"
                      : "border-border text-brand-700 hover:border-brand-400"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="mt-6 flex gap-2">
          {stepIndex > 0 && (
            <Button type="button" variant="secondary" onClick={back} className="flex-1">
              Geri
            </Button>
          )}
          {!isLast ? (
            <Button type="button" onClick={next} className="flex-1">
              İleri →
            </Button>
          ) : (
            <form action={completeOnboarding} className="flex-1">
              {Object.entries(values).map(([key, value]) => (
                <input key={key} type="hidden" name={key} value={value} />
              ))}
              <Button type="submit" className="w-full">
                Planımı oluştur →
              </Button>
            </form>
          )}
        </div>
      </Card>

      <form action={skipOnboarding} className="mt-4 text-center">
        <button className="text-xs text-brand-400 hover:text-brand-600">Şimdilik atla</button>
      </form>
    </div>
  );
}
