"use client";

import { useState } from "react";

const FAQ_ITEMS = [
  {
    q: "AI mülakatlar ne kadar gerçekçi?",
    a: "AI mülakatçı, gerçek bir danışmanlık mülakatındaki gibi seni yönlendirmez — sorularla düşünmeye teşvik eder, varsayımlarını sorgular ve gerektiğinde zorlayıcı takip soruları sorar.",
  },
  {
    q: "Sesli pratik yapabilir miyim?",
    a: "Evet. Yazılı veya sesli mod arasında seçim yapabilirsin; sesli modda AI seni dinler ve sesli olarak yanıt verir.",
  },
  {
    q: "Ne tür case'ler mevcut?",
    a: "Pazara giriş, karlılık, büyüme, birleşme & satın alma, fiyatlandırma ve operasyon kategorilerinde farklı zorluk seviyelerinde case'ler bulabilirsin.",
  },
  {
    q: "Prova'yı McKinsey / BCG / Bain mülakatlarına hazırlanmak için kullanabilir miyim?",
    a: "Evet, case'ler üst düzey yönetim danışmanlığı firmalarının mülakat formatına uygun şekilde tasarlandı.",
  },
  {
    q: "Geri bildirim nasıl çalışıyor?",
    a: "Her oturum sonunda yapı, analiz, iş muhakemesi, iletişim ve sayısal akıl yürütme boyutlarında puanlanan detaylı bir rapor alırsın; güçlü yönlerin ve gelişim alanların net şekilde belirtilir.",
  },
  {
    q: "İstediğim zaman iptal edebilir miyim?",
    a: "Evet, Pro veya Coach aboneliğini istediğin zaman iptal edebilirsin, herhangi bir taahhüt yok.",
  },
];

export function Faq() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto flex max-w-3xl flex-col divide-y divide-border border-y border-border">
      {FAQ_ITEMS.map((item, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={item.q}>
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              aria-expanded={isOpen}
              className="flex w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="text-sm font-medium text-brand-900 sm:text-base">{item.q}</span>
              <span
                className={`shrink-0 text-lg text-brand-400 transition-transform ${isOpen ? "rotate-45" : ""}`}
                aria-hidden
              >
                +
              </span>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-out ${
                isOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                <p className="pb-5 text-sm leading-relaxed text-brand-600">{item.a}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
