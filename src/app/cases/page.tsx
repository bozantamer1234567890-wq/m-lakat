import { createClient } from "@/lib/supabase/server";
import { Card, Badge, Button } from "@/components/ui";
import { startSession } from "@/app/cases/actions";
import type { CaseRow } from "@/lib/types";

const DIFFICULTY_LABEL: Record<CaseRow["difficulty"], string> = {
  easy: "Kolay",
  medium: "Orta",
  hard: "Zor",
};

export default async function CasesPage() {
  const supabase = await createClient();
  const { data: cases } = await supabase
    .from("cases")
    .select("*")
    .eq("is_published", true)
    .order("created_at", { ascending: false });

  return (
    <div className="mx-auto max-w-5xl px-6 py-10">
      <h1 className="text-2xl font-semibold text-brand-900">Case kütüphanesi</h1>
      <p className="mt-1 text-sm text-brand-600">
        Bir case seç, sesli ya da yazılı mülakat modunda pratiğe başla.
      </p>

      <div className="mt-8 grid grid-cols-1 gap-4 sm:grid-cols-2">
        {(cases ?? []).map((c: CaseRow) => (
          <Card key={c.id} className="flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2">
                <Badge>{c.industry}</Badge>
                <Badge>{DIFFICULTY_LABEL[c.difficulty]}</Badge>
              </div>
              <h3 className="mt-3 font-medium text-brand-900">{c.title}</h3>
              <p className="mt-2 text-sm text-brand-600">{c.summary}</p>
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
              Henüz case eklenmemiş. `npm run db:seed` komutuyla örnek caseleri oluşturabilirsin.
            </p>
          </Card>
        )}
      </div>
    </div>
  );
}
