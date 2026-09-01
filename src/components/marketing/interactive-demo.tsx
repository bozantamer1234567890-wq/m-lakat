"use client";

import { useState } from "react";
import { LinkButton } from "@/components/ui";

const OPTIONS = [
  {
    label: "Önce pazarı büyüklüğüne göre segmentlere ayırırım, sonra her segmentin karlılığına bakarım.",
    quality: "strong" as const,
    note: "Güçlü açılış — problemi net, MECE bir çerçeveyle bölüyorsun.",
  },
  {
    label: "Direkt fiyatları düşürmeyi önerip rakip analizine geçerim.",
    quality: "weak" as const,
    note: "Çok erken bir tavsiye — önce problemi yapılandırmadan çözüme atlıyorsun.",
  },
  {
    label: "Müşteriden hangi pazarları düşündüğünü sorup ona göre devam ederim.",
    quality: "medium" as const,
    note: "Makul bir açılış ama kendi çerçeveni henüz ortaya koymadın.",
  },
];

const SCORES: Record<(typeof OPTIONS)[number]["quality"], number> = {
  strong: 82,
  medium: 61,
  weak: 38,
};

export function InteractiveDemo() {
  const [selected, setSelected] = useState<number | null>(null);

  const choice = selected !== null ? OPTIONS[selected] : null;

  return (
    <div className="mx-auto max-w-2xl rounded-2xl border border-border bg-surface p-6 sm:p-8">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-400">Mini case</p>
      <p className="mt-3 text-base text-brand-900 sm:text-lg">
        &ldquo;Avrupalı bir havayolu şirketi Türkiye pazarına girmeyi değerlendiriyor ve kârlılık
        potansiyelini anlamak istiyor. Bu problemi nasıl yapılandırırsın?&rdquo;
      </p>

      {!choice ? (
        <div className="mt-6 flex flex-col gap-2">
          {OPTIONS.map((opt, i) => (
            <button
              key={opt.label}
              onClick={() => setSelected(i)}
              className="rounded-xl border border-border px-4 py-3 text-left text-sm text-brand-700 transition-colors hover:border-brand-500 hover:bg-brand-50"
            >
              {opt.label}
            </button>
          ))}
        </div>
      ) : (
        <div className="mt-6 animate-fade-up">
          <div className="flex items-center justify-between rounded-xl border border-border bg-surface-muted px-4 py-3">
            <span className="text-sm text-brand-700">Yapı skorun</span>
            <span className="text-2xl font-semibold text-brand-900">{SCORES[choice.quality]}</span>
          </div>
          <p className="mt-3 text-sm text-brand-600">{choice.note}</p>

          <div className="mt-6 rounded-xl border border-dashed border-border p-4 text-center">
            <p className="text-sm text-brand-700">Tam analizi görmek ister misin?</p>
            <LinkButton href="/signup" className="mt-3 w-full sm:w-auto">
              Ücretsiz hesap oluştur →
            </LinkButton>
          </div>
        </div>
      )}
    </div>
  );
}
