import Link from "next/link";

const COLUMNS: { title: string; links: { href: string; label: string }[] }[] = [
  {
    title: "Ürün",
    links: [
      { href: "/cases", label: "Pratik" },
      { href: "/cases", label: "Case kütüphanesi" },
      { href: "/#nasil-calisir", label: "Nasıl çalışır" },
      { href: "/pricing", label: "Fiyatlandırma" },
    ],
  },
  {
    title: "Kaynaklar",
    links: [
      { href: "/cases", label: "Case rehberleri" },
      { href: "/#nasil-calisir", label: "Mülakat ipuçları" },
      { href: "/#sss", label: "SSS" },
    ],
  },
  {
    title: "Şirket",
    links: [
      { href: "/#", label: "Hakkımızda" },
      { href: "/#", label: "İletişim" },
      { href: "/#", label: "Gizlilik" },
      { href: "/#", label: "Kullanım şartları" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-background">
      <div className="mx-auto max-w-6xl px-6 py-14">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          <div className="col-span-2 sm:col-span-1">
            <p className="text-lg font-semibold tracking-tight text-brand-900">PROVA</p>
            <p className="mt-2 max-w-[22ch] text-sm text-brand-600">
              AI destekli case interview pratiği.
            </p>
          </div>
          {COLUMNS.map((col) => (
            <div key={col.title}>
              <p className="text-xs font-medium uppercase tracking-wide text-brand-400">
                {col.title}
              </p>
              <ul className="mt-3 flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-brand-600 transition-colors hover:text-brand-900"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-xs text-brand-400 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} Prova. Tüm hakları saklıdır.</p>
          <p>Consulting mülakatlarına hazırlanan adaylar için tasarlandı.</p>
        </div>
      </div>
    </footer>
  );
}
