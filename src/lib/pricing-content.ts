export type PricingPlanId = "free" | "pro" | "coach";

export type PricingPlanContent = {
  id: PricingPlanId;
  name: string;
  subtitle: string;
  tagline: string;
  features: string[];
  ctaLabel: string;
  badge?: string;
};

export const PRICING_PLANS_CONTENT: PricingPlanContent[] = [
  {
    id: "free",
    name: "Ücretsiz",
    subtitle: "Prova'yı keşfet",
    tagline: "Case interview dünyasını keşfet.",
    features: ["2 mülakat oturumu", "Yazılı pratik", "Temel geri bildirim"],
    ctaLabel: "Ücretsiz başla",
  },
  {
    id: "pro",
    name: "Pro",
    subtitle: "Ciddi hazırlık için",
    tagline: "Ciddi hazırlık yapanlar için.",
    features: [
      "Sınırsız mülakat oturumu",
      "Sesli AI mülakatlar",
      "Gelişmiş geri bildirim",
      "Performans ve ilerleme takibi",
      "Tüm case kütüphanesi",
    ],
    ctaLabel: "Pro'ya geç →",
    badge: "En popüler",
  },
  {
    id: "coach",
    name: "Coach",
    subtitle: "Kişisel AI case coach'un",
    tagline: "AI destekli kişisel hazırlık sistemi.",
    features: [
      "Pro'daki her şey",
      "Adaptif AI mülakatçı",
      "Kişiselleştirilmiş pratik planı",
      "Zayıf olduğun becerileri otomatik tespit",
      "Tekrarlayan hataları takip et",
      "Sana özel case önerileri",
      "Detaylı performans analitiği",
    ],
    ctaLabel: "Coach'a geç →",
  },
];

/** "Hangi plan sana uygun?" karşılaştırma tablosu satırları. true/false = plan bu özelliği içerir. */
export const PRICING_COMPARISON_ROWS: { label: string; free: boolean; pro: boolean; coach: boolean }[] = [
  { label: "Case pratiği", free: true, pro: true, coach: true },
  { label: "AI mülakat", free: true, pro: true, coach: true },
  { label: "Sesli mülakat", free: false, pro: true, coach: true },
  { label: "Gelişmiş geri bildirim", free: false, pro: true, coach: true },
  { label: "Performans takibi", free: false, pro: true, coach: true },
  { label: "Tüm case kütüphanesi", free: false, pro: true, coach: true },
  { label: "Adaptif AI mülakatçı", free: false, pro: false, coach: true },
  { label: "Kişisel çalışma planı", free: false, pro: false, coach: true },
  { label: "Hata takibi", free: false, pro: false, coach: true },
  { label: "Zayıf alan analizi", free: false, pro: false, coach: true },
  { label: "Kişiselleştirilmiş öneriler", free: false, pro: false, coach: true },
];
