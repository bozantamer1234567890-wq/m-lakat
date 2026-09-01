export type InterviewPhase =
  | "opening"
  | "structure"
  | "analysis"
  | "recommendation"
  | "completed";

export const PHASE_ORDER: InterviewPhase[] = [
  "opening",
  "structure",
  "analysis",
  "recommendation",
  "completed",
];

export const PHASE_LABELS: Record<InterviewPhase, string> = {
  opening: "Açılış",
  structure: "Strateji / Yapılandırma",
  analysis: "Analiz",
  recommendation: "Tavsiye",
  completed: "Tamamlandı",
};

const PHASE_GUIDANCE: Record<InterviewPhase, string> = {
  opening:
    "Adayı kısaca karşıla, case'i tek paragrafta özetle ve adaydan case'i kendi cümleleriyle özetlemesini iste. Henüz çözüme girme.",
  structure:
    "Adayın probleme nasıl bir çerçeveyle (framework) yaklaşacağını sor, yapısını netleştirmesine yardım et. Kendi çözümünü verme, sorularla yönlendir.",
  analysis:
    "Adaya sayısal/nitel bir alt problem ver (ör. pazar büyüklüğü, karlılık, kapasite hesabı). Hesaplamalarını sorgula, varsayımlarını netleştirmesini iste.",
  recommendation:
    "Adaydan bulgularını özetleyip net bir tavsiye ve gerekçe sunmasını iste. Tavsiyesini gerçekçi risklerle test et.",
  completed: "Görüşme bitti; adaya teşekkür et ve kısa bir kapanış cümlesi kur.",
};

export function nextPhase(current: InterviewPhase): InterviewPhase {
  const idx = PHASE_ORDER.indexOf(current);
  return PHASE_ORDER[Math.min(idx + 1, PHASE_ORDER.length - 1)];
}

export type InterviewStyle = "real" | "training";
export type CandidateLevel = "developing" | "average" | "strong";

const LEVEL_GUIDANCE: Record<CandidateLevel, string> = {
  strong:
    "Adayın geçmiş performansı güçlü. Daha zorlayıcı takip soruları sor: varsayımlarını kanıtlamasını iste, sonucu değiştirecek senaryoları sor, etkiyi sayısallaştırmasını iste.",
  developing:
    "Adayın geçmiş performansı gelişim aşamasında. Sorularını biraz daha küçük adımlara böl, ama yine de çözümü kendisi bulmalı — doğrudan çerçeve verme.",
  average: "",
};

const STYLE_GUIDANCE: Record<InterviewStyle, string> = {
  real:
    "GERÇEK MÜLAKAT MODU: Gerçek bir mülakatçı gibi davran. İpucu verme, çerçeve önerme, hesaplamada yardım etme. Aday takılırsa sorularla düşünmeye teşvik et ama çözümü söyleme. Varsayımlarını sorgula, gerektiğinde zorlayıcı takip soruları sor.",
  training:
    "ANTRENMAN MODU: Aday açıkça ipucu isterse (ör. \"ipucu\", \"yardım\", \"takıldım\" derse) kısa bir çerçeve önerisi, hesaplama yardımı veya netleştirme sun. İstemedikçe hâlâ kendi başına düşünmesini teşvik et, doğrudan cevap verme.",
};

export function buildSystemPrompt(
  casePrompt: string,
  phase: InterviewPhase,
  style: InterviewStyle = "real",
  level: CandidateLevel = "average"
) {
  return [
    "Sen deneyimli bir üst düzey yönetim danışmanlığı (McKinsey/BCG/Bain tarzı) mülakatçısısın.",
    "Aşağıdaki case üzerinden adayla gerçekçi, sesli/yazılı bir case interview simülasyonu yürütüyorsun.",
    "Kurallar:",
    "- Kısa, net, profesyonel ve nazik konuş. Tek seferde tek soru sor.",
    "- Adayın yerine düşünme; adayı yönlendirici sorularla düşünmeye teşvik et.",
    "- Türkçe konuş (aday başka bir dilde yazarsa o dile geç).",
    "- " + STYLE_GUIDANCE[style],
    LEVEL_GUIDANCE[level] ? "- " + LEVEL_GUIDANCE[level] : null,
    "- Şu anki aşama: " + phase + ". " + PHASE_GUIDANCE[phase],
    "",
    "CASE BRIEF:",
    casePrompt,
  ]
    .filter((line): line is string => line !== null)
    .join("\n");
}

/** Son tamamlanan oturumların ortalama skoruna göre adayın seviyesini tahmin eder (adaptif zorluk için). */
export function candidateLevelFromAverage(avgOverallScore: number | null): CandidateLevel {
  if (avgOverallScore === null) return "average";
  if (avgOverallScore >= 78) return "strong";
  if (avgOverallScore <= 50) return "developing";
  return "average";
}

export function buildFeedbackPrompt(caseSummary: string, transcript: string) {
  return [
    "Aşağıda bir case interview transkripti var. Adayın performansını değerlendir.",
    "Şu case üzerinden mülakat yapıldı: " + caseSummary,
    "",
    "TRANSKRİPT:",
    transcript,
    "",
    "business_judgment_score: adayın önerilerinin ticari gerçekçiliğini ve risk farkındalığını ölçer.",
    "quantitative_reasoning_score: adayın sayısal hesaplama ve varsayım netliğini ölçer.",
    "Şu JSON şemasına birebir uyan bir çıktı üret (başka hiçbir metin ekleme):",
    `{"overall_score": 0-100, "structure_score": 0-100, "analysis_score": 0-100, "communication_score": 0-100, "business_judgment_score": 0-100, "quantitative_reasoning_score": 0-100, "strengths": "kısa madde madde metin", "improvements": "kısa madde madde metin", "summary": "2-3 cümlelik genel değerlendirme"}`,
  ].join("\n");
}
