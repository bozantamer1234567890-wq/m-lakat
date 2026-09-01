import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, Button } from "@/components/ui";
import { startSession } from "@/app/cases/actions";
import { CATEGORY_LABELS, DIFFICULTY_LABELS } from "@/lib/cases";
import type { CaseCategory, CaseRow } from "@/lib/types";

const CATEGORY_FILTERS: { value: CaseCategory | "all"; label: string }[] = [
  { value: "all", label: "Tümü" },
  { value: "pazara-girisi", label: CATEGORY_LABELS["pazara-girisi"] },
  { value: "karlilik", label: CATEGORY_LABELS.karlilik },
  { value: "buyume", label: CATEGORY_LABELS.buyume },
  { value: "birlesme-satin-alma", label: CATEGORY_LABELS["birlesme-satin-alma"] },
  { value: "fiyatlandirma", label: CATEGORY_LABELS.fiyatlandirma },
  { value: "operasyon", label: CATEGORY_LABELS.operasyon },
];

export default async function CasesPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string }>;
}) {
  const { category: categoryParam } = await searchParams;
  const activeCategory = CATEGORY_FILTERS.some((f) => f.value === categoryParam)
    ? (categoryParam as CaseCategory | "all")
    : "all";

  const supabase = await createClient();
  let query = supabase.from("cases").select("*").eq("is_published", true);
  if (activeCategory !== "all") {
    query = query.eq("category", activeCategory);
  }
  const { data: cases } = await query.order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-brand-900">Case kütüphanesi</h1>
      <p className="mt-1 text-sm text-brand-600">
        Bir case seç, sesli ya da yazılı mülakat modunda pratiğe başla.
      </p>

      <div className="mt-6 flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((f) => (
          <Link
            key={f.value}
            href={f.value === "all" ? "/cases" : `/cases?category=${f.value}`}
            className={`rounded-full border px-3.5 py-1.5 text-sm transition-colors ${
              activeCategory === f.value
                ? "border-brand-500 bg-brand-500 text-white"
                : "border-border text-brand-700 hover:border-brand-400"
            }`}
          >
            {f.label}
          </Link>
        ))}
      </div>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(cases ?? []).map((c: CaseRow) => (
          <Card key={c.id} className="flex flex-col justify-between">
            <div>
              <div className="flex flex-wrap items-center gap-2">
                <Badge>{c.industry}</Badge>
                <Badge>{DIFFICULTY_LABELS[c.difficulty]}</Badge>
                <Badge>{CATEGORY_LABELS[c.category]}</Badge>
              </div>
              <h3 className="mt-3 font-medium text-brand-900">{c.title}</h3>
              <p className="mt-2 text-sm text-brand-600">{c.summary}</p>
              <p className="mt-2 text-xs text-brand-400">~{c.estimated_minutes} dk</p>
            </div>
            <form action={startSession} className="mt-4 flex gap-2">
              <input type="hidden" name="case_id" value={c.id} />
              <Button type="submit" name="mode" value="text" variant="secondary" className="flex-1">
                Yazılı başla
              </Button>
              <Button type="submit" name="mode" value="voice" className="flex-1">
                Sesli başla
              </Button>
            </form>
          </Card>
        ))}
        {(cases ?? []).length === 0 && (
          <Card>
            <p className="text-sm text-brand-600">
              Bu kategoride henüz case yok. `npm run db:seed` komutuyla örnek caseleri oluşturabilirsin.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
