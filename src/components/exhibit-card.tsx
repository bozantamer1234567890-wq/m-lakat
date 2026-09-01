import type { Exhibit } from "@/lib/ai/exhibit";

export function ExhibitCard({ exhibit }: { exhibit: Exhibit }) {
  return (
    <div className="w-full max-w-[420px] rounded-xl border border-border bg-surface p-4 shadow-[0_4px_20px_rgba(17,19,21,0.04)]">
      <p className="text-xs font-medium uppercase tracking-wide text-brand-400">Exhibit</p>
      <h4 className="mt-1 text-sm font-medium text-brand-900">{exhibit.title}</h4>

      {exhibit.type === "table" ? (
        <div className="mt-3 overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {exhibit.columns.map((col) => (
                  <th
                    key={col}
                    className="border-b border-border pb-1.5 pr-3 text-left font-medium text-brand-400"
                  >
                    {col}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {exhibit.rows.map((row, i) => (
                <tr key={i}>
                  {row.map((cell, j) => (
                    <td key={j} className="border-b border-border py-1.5 pr-3 text-brand-800">
                      {cell}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="mt-3 flex flex-col gap-2">
          {exhibit.series.map((s) => {
            const max = Math.max(...exhibit.series.map((x) => x.value), 1);
            return (
              <div key={s.label}>
                <div className="flex justify-between text-xs text-brand-600">
                  <span>{s.label}</span>
                  <span className="font-medium text-brand-900">
                    {s.value}
                    {exhibit.unit ? ` ${exhibit.unit}` : ""}
                  </span>
                </div>
                <div className="mt-1 h-1.5 rounded-full bg-brand-100">
                  <div
                    className="h-1.5 rounded-full bg-brand-500"
                    style={{ width: `${(s.value / max) * 100}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
