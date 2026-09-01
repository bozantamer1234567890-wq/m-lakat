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

export function buildSystemPrompt(casePrompt: string, phase: InterviewPhase) {
  return [
    "Sen deneyimli bir üst düzey yönetim danışmanlığı (McKinsey/BCG/Bain tarzı) mülakatçısısın.",
    "Aşağıdaki case üzerinden adayla gerçekçi, sesli/yazılı bir case interview simülasyonu yürütüyorsun.",
    "Kurallar:",
    "- Kısa, net, profesyonel ve nazik konuş. Tek seferde tek soru sor.",
    "- Adayın yerine düşünme; adayı yönlendirici sorularla düşünmeye teşvik et.",
    "- Türkçe konuş (aday başka bir dilde yazarsa o dile geç).",
    "- Şu anki aşama: " + phase + ". " + PHASE_GUIDANCE[phase],
    "",
    "CASE BRIEF:",
    casePrompt,
  ].join("\n");
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
