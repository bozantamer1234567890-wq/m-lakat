export type Exhibit =
  | { title: string; type: "table"; columns: string[]; rows: (string | number)[][] }
  | { title: string; type: "bar_chart"; unit?: string; series: { label: string; value: number }[] };

const EXHIBIT_BLOCK = /\[EXHIBIT\]([\s\S]*?)\[\/EXHIBIT\]/;

/** AI cevabındaki [EXHIBIT]...[/EXHIBIT] bloğunu ayıklar; kalan metni ve varsa exhibit'i döndürür. */
export function extractExhibit(reply: string): { text: string; exhibit: Exhibit | null } {
  const match = reply.match(EXHIBIT_BLOCK);
  if (!match) return { text: reply.trim(), exhibit: null };

  let exhibit: Exhibit | null = null;
  try {
    const parsed = JSON.parse(match[1].trim());
    if (
      parsed &&
      typeof parsed.title === "string" &&
      (parsed.type === "table" || parsed.type === "bar_chart")
    ) {
      exhibit = parsed as Exhibit;
    }
  } catch {
    exhibit = null;
  }

  const text = reply.replace(EXHIBIT_BLOCK, "").trim();
  return { text, exhibit };
}

export const EXHIBIT_PROMPT_GUIDANCE = [
  "EXHIBIT KULLANIMI: Analiz aşamasında, adayın yorumlaması gereken somut bir veri olduğunda",
  "(gelir/segment kırılımı, P&L, pazar payı, maliyet dağılımı, büyüme grafiği gibi) mesajının",
  "SONUNA şu formatta bir blok ekle (sadece gerçekten faydalıysa, her mesajda değil):",
  "[EXHIBIT]",
  '{"title": "Kısa başlık", "type": "table", "columns": ["Sütun1", "Sütun2"], "rows": [["Satır1a", "Satır1b"]]}',
  "[/EXHIBIT]",
  "Ya da tek seri bir karşılaştırma için:",
  "[EXHIBIT]",
  '{"title": "Kısa başlık", "type": "bar_chart", "unit": "M€", "series": [{"label": "Segment A", "value": 42}]}',
  "[/EXHIBIT]",
  "Bloktan önce kısa bir cümleyle exhibit'i tanıt (ör. \"Sana gelir kırılımını göstereyim.\"), bloktan",
  "sonra adaydan exhibit'i yorumlamasını iste. Veriler gerçekçi ama uydurma olabilir — case'e tutarlı olsun.",
].join("\n");
