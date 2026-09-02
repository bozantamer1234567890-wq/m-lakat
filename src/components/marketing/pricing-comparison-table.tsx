import { PRICING_COMPARISON_ROWS, PRICING_PLANS_CONTENT } from "@/lib/pricing-content";

function Check({ included }: { included: boolean }) {
  return (
    <span className={included ? "text-brand-500" : "text-brand-300"} aria-label={included ? "Dahil" : "Dahil değil"}>
      {included ? "✓" : "—"}
    </span>
  );
}

export function PricingComparisonTable() {
  const free = PRICING_PLANS_CONTENT.find((p) => p.id === "free")!;
  const pro = PRICING_PLANS_CONTENT.find((p) => p.id === "pro")!;
  const coach = PRICING_PLANS_CONTENT.find((p) => p.id === "coach")!;

  return (
    <div className="mt-20 text-left">
      <h2 className="text-center text-2xl font-semibold text-brand-900">Hangi plan sana uygun?</h2>

      <div className="mt-10 overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-sm">
          <thead>
            <tr>
              <th className="border-b border-border pb-4 pr-4 text-left font-normal text-brand-500"></th>
              <th className="border-b border-border px-4 pb-4 text-center">
                <p className="font-medium text-brand-900">{free.name}</p>
                <p className="mt-0.5 text-xs font-normal text-brand-500">{free.subtitle}</p>
              </th>
              <th className="border-b border-brand-500 border-b-2 px-4 pb-4 text-center">
                <p className="font-medium text-brand-900">{pro.name}</p>
                <p className="mt-0.5 text-xs font-normal text-brand-500">{pro.subtitle}</p>
              </th>
              <th className="border-b border-border px-4 pb-4 text-center">
                <p className="font-medium text-brand-900">{coach.name}</p>
                <p className="mt-0.5 text-xs font-normal text-brand-500">{coach.subtitle}</p>
              </th>
            </tr>
          </thead>
          <tbody>
            {PRICING_COMPARISON_ROWS.map((row) => (
              <tr key={row.label}>
                <td className="border-b border-border py-3 pr-4 text-brand-700">{row.label}</td>
                <td className="border-b border-border px-4 py-3 text-center">
                  <Check included={row.free} />
                </td>
                <td className="border-b border-border px-4 py-3 text-center">
                  <Check included={row.pro} />
                </td>
                <td className="border-b border-border px-4 py-3 text-center">
                  <Check included={row.coach} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
