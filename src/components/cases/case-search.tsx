import { Button } from "@/components/ui";

export function CaseSearch({
  query,
  category,
  difficulty,
  duration,
  skill,
}: {
  query: string;
  category: string;
  difficulty: string;
  duration: string;
  skill: string;
}) {
  return (
    <form action="/cases" method="get" className="flex gap-2">
      {category !== "all" && <input type="hidden" name="category" value={category} />}
      {difficulty !== "all" && <input type="hidden" name="difficulty" value={difficulty} />}
      {duration !== "all" && <input type="hidden" name="duration" value={duration} />}
      {skill !== "all" && <input type="hidden" name="skill" value={skill} />}
      <input
        type="search"
        name="q"
        defaultValue={query}
        placeholder="Case ara..."
        className="w-full rounded-lg border border-border bg-surface px-3.5 py-2 text-sm text-brand-900 placeholder:text-brand-400 focus:border-brand-400 focus:outline-none"
      />
      <Button type="submit" variant="secondary">
        Ara
      </Button>
    </form>
  );
}
