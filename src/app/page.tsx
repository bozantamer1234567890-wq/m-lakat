import { LinkButton } from "@/components/ui";
import { Faq } from "@/components/marketing/faq";
import { InteractiveDemo } from "@/components/marketing/interactive-demo";

const PROCESS_STEPS = [
  {
    n: "01",
    title: "Hazırlığını ölç",
    desc: "5 dakikalık diagnostic mülakatla şu anki seviyeni gör: yapı, analiz, iş muhakemesi, iletişim, sayısal akıl yürütme.",
  },
  {
    n: "02",
    title: "AI ile gerçek mülakat yap",
    desc: "Zorlayan gerçek mod veya ipucu alabildiğin antrenman modu — sistem, geçmiş performansına göre soru zorluğunu otomatik ayarlar.",
  },
  {
    n: "03",
    title: "Sonraki case otomatik önerilir",
    desc: "Her oturum sonunda en zayıf becerini tespit eder, tekrarlayan hataları işaretler ve tam o beceriyi çalıştıracak case'i önerir.",
  },
];

const CASE_LIBRARY_PREVIEW = [
  { title: "Avrupa kahve zinciri", category: "Pazara Giriş", difficulty: "Orta", minutes: 30 },
  { title: "Perakende karlılık düşüşü", category: "Karlılık", difficulty: "Zor", minutes: 35 },
  { title: "Yemek teslimat büyümesi", category: "Büyüme", difficulty: "Kolay", minutes: 25 },
];

const TARGET_FIRMS = ["McKinsey", "BCG", "Bain", "Deloitte", "Strategy&", "Kearney"];

export default function Home() {
  return (
    <div>
      {/* ---------- HERO ---------- */}
      <section className="mx-auto grid max-w-6xl gap-12 px-6 pb-20 pt-16 sm:pt-24 lg:grid-cols-2 lg:items-center lg:gap-8">
        <div className="animate-fade-up">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-500">
            Yapay zeka destekli case interview pratiği
          </p>
          <h1 className="mt-5 text-4xl font-semibold leading-[1.05] tracking-tight text-brand-900 sm:text-5xl lg:text-[3.4rem]">
            Net düşün.
            <br />
            Daha iyi yapılandır.
            <br />
            Özgüvenle mülakat yap.
          </h1>
          <p className="mt-6 max-w-md text-base leading-relaxed text-brand-600 sm:text-lg">
            AI mülakatçıyla gerçekçi case interview&apos;ler yap. Yapını, analizini ve
            iletişimini pratik et — dakikalar içinde somut geri bildirim al.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <LinkButton href="/signup">Ücretsiz case başlat →</LinkButton>
            <LinkButton href="/cases" variant="secondary">
              Demoyu dene
            </LinkButton>
          </div>
        </div>

        {/* Live case session mockup */}
        <div className="animate-fade-up rounded-2xl border border-dark-border bg-dark-surface p-5 text-dark-foreground shadow-xl sm:p-6">
          <div className="flex items-center justify-between border-b border-dark-border pb-4">
            <p className="text-xs font-medium uppercase tracking-widest text-brand-400">
              Canlı mülakat oturumu
            </p>
            <span className="flex items-center gap-1.5 text-xs text-brand-400">
              <span className="h-1.5 w-1.5 rounded-full bg-success" />
              Dinliyor
            </span>
          </div>

          <div className="mt-4 flex flex-col gap-3 text-sm">
            <div>
              <p className="text-xs text-brand-400">Mülakatçı</p>
              <p className="mt-1 leading-relaxed text-dark-foreground">
                &ldquo;Müşteriniz Avrupa merkezli bir perakende şirketi...&rdquo;
              </p>
            </div>
            <div className="ml-auto max-w-[85%] rounded-xl bg-white/5 px-3 py-2">
              <p className="text-xs text-brand-400">Aday</p>
              <p className="mt-1 leading-relaxed text-dark-foreground">
                &ldquo;Yapılandırmaya geçmeden önce birkaç noktayı netleştirmek isterim...&rdquo;
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-2 border-t border-dark-border pt-4">
            {[
              { label: "Yapı", value: 84 },
              { label: "Analiz", value: 78 },
              { label: "İletişim", value: 91 },
            ].map((m) => (
              <div key={m.label} className="flex items-center gap-3">
                <span className="w-20 shrink-0 text-xs text-brand-400">{m.label}</span>
                <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full rounded-full bg-brand-500" style={{ width: `${m.value}%` }} />
                </div>
                <span className="w-7 shrink-0 text-right text-xs text-dark-foreground">{m.value}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- PROCESS (product not marketing) ---------- */}
      <section id="nasil-calisir" className="border-t border-border bg-surface-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <h2 className="max-w-lg text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
            Bir sonraki mülakatın burada başlıyor.
          </h2>
          <p className="mt-3 max-w-lg text-sm text-brand-500">
            Prova sadece case vermez — nasıl mülakat yaptığını öğrenir.
          </p>
          <div className="mt-14 grid gap-10 sm:grid-cols-3 sm:gap-8">
            {PROCESS_STEPS.map((step) => (
              <div key={step.n} className="border-t border-border pt-5">
                <span className="text-sm font-medium text-brand-400">{step.n}</span>
                <h3 className="mt-3 text-lg font-medium text-brand-900">{step.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-brand-600">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CASE SIMULATOR ---------- */}
      <section className="border-t border-dark-border bg-dark-surface text-dark-foreground">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-400">
            Case interview simülatörü
          </p>
          <h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-tight sm:text-4xl">
            Gerçek bir mülakat masasında oturuyormuş gibi hisset.
          </h2>

          <div className="mt-12 grid gap-px overflow-hidden rounded-2xl border border-dark-border bg-dark-border sm:grid-cols-[200px_1fr_200px]">
            <div className="bg-dark-surface p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-400">Case bilgisi</p>
              <dl className="mt-4 flex flex-col gap-3 text-sm">
                <div>
                  <dt className="text-xs text-brand-400">Sektör</dt>
                  <dd className="mt-0.5">Perakende</dd>
                </div>
                <div>
                  <dt className="text-xs text-brand-400">Zorluk</dt>
                  <dd className="mt-0.5">Orta</dd>
                </div>
                <div>
                  <dt className="text-xs text-brand-400">Süre</dt>
                  <dd className="mt-0.5 tabular-nums">32:14</dd>
                </div>
              </dl>
            </div>

            <div className="bg-dark-surface p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-400">Görüşme</p>
              <div className="mt-4 flex flex-col gap-3 text-sm">
                <p className="leading-relaxed text-dark-foreground/90">
                  <span className="text-brand-400">Mülakatçı: </span>
                  &ldquo;Kârlılıktaki düşüşün ana sürücüsü ne olabilir?&rdquo;
                </p>
                <p className="leading-relaxed text-dark-foreground/90">
                  <span className="text-brand-400">Aday: </span>
                  &ldquo;Bunu gelir ve maliyet tarafı olarak ikiye ayırarak bakmak isterim...&rdquo;
                </p>
              </div>
            </div>

            <div className="bg-dark-surface p-5">
              <p className="text-xs font-medium uppercase tracking-wide text-brand-400">Canlı metrikler</p>
              <div className="mt-4 flex flex-col gap-3">
                {[
                  { label: "Yapı", value: 84 },
                  { label: "Hipotez", value: 72 },
                  { label: "İletişim", value: 91 },
                ].map((m) => (
                  <div key={m.label}>
                    <div className="flex justify-between text-xs">
                      <span className="text-brand-400">{m.label}</span>
                      <span className="text-dark-foreground">{m.value}%</span>
                    </div>
                    <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-white/10">
                      <div
                        className="h-full rounded-full bg-brand-500"
                        style={{ width: `${m.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- VOICE EXPERIENCE ---------- */}
      <section className="border-t border-border">
        <div className="mx-auto grid max-w-6xl gap-12 px-6 py-20 sm:py-28 lg:grid-cols-2 lg:items-center">
          <div>
            <p className="text-xs font-medium uppercase tracking-widest text-brand-500">
              Sesli mülakat
            </p>
            <h2 className="mt-4 text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
              Sesli olarak anlat.
            </h2>
            <p className="mt-4 max-w-md text-base leading-relaxed text-brand-600">
              Case interview&apos;ler yazılı sınav değildir. Varsayımlarını sorgulayan bir AI
              mülakatçıyla yüksek sesle düşünmeyi pratik et.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-surface p-6 sm:p-8">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-xs font-medium text-brand-500">
                <span className="h-1.5 w-1.5 rounded-full bg-success" />
                Dinliyor…
              </span>
              <span className="text-xs tabular-nums text-brand-400">00:42</span>
            </div>

            <div className="mt-6 flex h-16 items-end justify-center gap-1" aria-hidden>
              {[6, 10, 16, 22, 14, 20, 10, 24, 12, 8, 18, 22, 10, 6, 16].map((h, i) => (
                <span
                  key={i}
                  className="animate-waveform w-1.5 rounded-full bg-brand-500"
                  style={{ height: `${h * 2}px`, animationDelay: `${i * 0.06}s` }}
                />
              ))}
            </div>

            <p className="mt-6 rounded-xl bg-surface-muted px-4 py-3 text-sm text-brand-700">
              &ldquo;Bu segmenti neden önceliklendirirdin?&rdquo;
            </p>
          </div>
        </div>
      </section>

      {/* ---------- FEEDBACK EXPERIENCE ---------- */}
      <section className="border-t border-border bg-surface-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-500">
            Geri bildirim
          </p>
          <h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
            Sadece case&apos;i bitirme. Nasıl performans gösterdiğini anla.
          </h2>

          <div className="mt-12 grid gap-6 lg:grid-cols-[280px_1fr]">
            <div className="rounded-2xl border border-border bg-surface p-6 text-center">
              <p className="text-sm text-brand-600">Genel skor</p>
              <p className="mt-2 text-5xl font-semibold text-brand-900">84</p>
              <p className="text-sm text-brand-400">/ 100</p>
              <div className="mt-6 flex flex-col gap-3 text-left">
                {[
                  { label: "Yapı", value: 86 },
                  { label: "Analiz", value: 81 },
                  { label: "İş muhakemesi", value: 78 },
                  { label: "İletişim", value: 91 },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs text-brand-600">
                      <span>{s.label}</span>
                      <span className="font-medium text-brand-900">{s.value}</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-brand-100">
                      <div
                        className="h-1.5 rounded-full bg-brand-500"
                        style={{ width: `${s.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              <div className="rounded-2xl border border-border bg-surface p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-400">
                  AI koçluk
                </p>
                <p className="mt-2 text-sm leading-relaxed text-brand-700">
                  Güçlü bir açılış yapısı kurdun. Problemi pazar ve müşteri sürücüleri olarak net
                  şekilde ayırdın.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-400">
                  Geliştirilecek alan
                </p>
                <p className="mt-2 text-sm leading-relaxed text-brand-700">
                  Hipotezini netleştirmeden hesaplamaya geçtin — önce varsayımını söyle, sonra
                  test et.
                </p>
              </div>
              <div className="rounded-2xl border border-border bg-surface p-6">
                <p className="text-xs font-medium uppercase tracking-wide text-brand-400">
                  Sıradaki pratik
                </p>
                <p className="mt-2 text-sm leading-relaxed text-brand-700">
                  Pazar büyüklüğü hesaplama — Orta seviye
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- PROGRESS DASHBOARD ---------- */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <p className="text-xs font-medium uppercase tracking-widest text-brand-500">
            İlerleme
          </p>
          <h2 className="mt-4 max-w-lg text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
            İlerlemeni zaman içinde takip et.
          </h2>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {[
              { label: "Tamamlanan case", value: "27" },
              { label: "Ortalama skor", value: "82" },
              { label: "Güncel seri", value: "6 gün" },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-border bg-surface p-6">
                <p className="text-sm text-brand-600">{s.label}</p>
                <p className="mt-1 text-3xl font-semibold text-brand-900">{s.value}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 grid gap-4 lg:grid-cols-[1fr_320px]">
            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-brand-600">Zaman içinde performans</p>
              <svg viewBox="0 0 300 80" className="mt-4 h-20 w-full" preserveAspectRatio="none" aria-hidden>
                <polyline
                  fill="none"
                  stroke="var(--brand-500)"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  points="0,60 40,55 80,58 120,40 160,44 200,28 240,32 300,14"
                />
              </svg>
              <div className="mt-3 flex flex-col gap-2 border-t border-border pt-3 text-sm">
                {[
                  { title: "Perakende karlılık", score: 82 },
                  { title: "Yemek teslimat büyümesi", score: 88 },
                  { title: "Havayolu genişlemesi", score: 76 },
                ].map((c) => (
                  <div key={c.title} className="flex items-center justify-between">
                    <span className="text-brand-700">{c.title}</span>
                    <span className="font-medium text-brand-900">{c.score}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-border bg-surface p-6">
              <p className="text-sm text-brand-600">Beceri dağılımı</p>
              <div className="mt-4 flex flex-col gap-3">
                {[
                  { label: "Yapı", value: 84 },
                  { label: "Analiz", value: 79 },
                  { label: "İletişim", value: 88 },
                ].map((s) => (
                  <div key={s.label}>
                    <div className="flex justify-between text-xs text-brand-600">
                      <span>{s.label}</span>
                      <span>{s.value}%</span>
                    </div>
                    <div className="mt-1 h-1.5 rounded-full bg-brand-100">
                      <div
                        className="h-1.5 rounded-full bg-brand-500"
                        style={{ width: `${s.value}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- SOCIAL PROOF ---------- */}
      <section className="border-t border-border bg-surface-muted/40">
        <div className="mx-auto max-w-4xl px-6 py-20 text-center sm:py-28">
          <h2 className="text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
            Hırslı adaylar için tasarlandı.
          </h2>
          <blockquote className="mx-auto mt-8 max-w-2xl text-xl leading-relaxed text-brand-800 sm:text-2xl">
            &ldquo;12 case&apos;ten sonra mülakatçı karşı çıktığında artık donmuyorum.&rdquo;
          </blockquote>
          <p className="mt-4 text-sm text-brand-500">— Strateji Danışmanlığı Adayı</p>

          <p className="mt-16 text-xs font-medium uppercase tracking-widest text-brand-400">
            Hedef firmalar
          </p>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-x-10 gap-y-3">
            {TARGET_FIRMS.map((firm) => (
              <span key={firm} className="text-lg font-medium text-brand-300">
                {firm}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- CASE LIBRARY PREVIEW ---------- */}
      <section className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="max-w-lg text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
              Gerçek hissettiren case&apos;lerle pratik yap.
            </h2>
            <LinkButton href="/cases" variant="secondary">
              Tüm case&apos;leri gör →
            </LinkButton>
          </div>

          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {CASE_LIBRARY_PREVIEW.map((c) => (
              <div key={c.title} className="rounded-2xl border border-border bg-surface p-6">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">
                    {c.category}
                  </span>
                  <span className="rounded-full bg-brand-100 px-2.5 py-1 text-xs font-medium text-brand-700">
                    {c.difficulty}
                  </span>
                </div>
                <h3 className="mt-4 font-medium text-brand-900">{c.title}</h3>
                <p className="mt-1 text-sm text-brand-500">{c.minutes} dk</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- INTERACTIVE DEMO ---------- */}
      <section className="border-t border-border bg-surface-muted/40">
        <div className="mx-auto max-w-6xl px-6 py-20 text-center sm:py-28">
          <h2 className="text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
            Kayıt olmadan önce bir case dene.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-base text-brand-600">
            Aşağıdaki mini case&apos;i cevapla, yapısal skorunu anında gör.
          </p>
          <div className="mt-10">
            <InteractiveDemo />
          </div>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section id="sss" className="border-t border-border">
        <div className="mx-auto max-w-6xl px-6 py-20 sm:py-28">
          <h2 className="text-center text-3xl font-semibold tracking-tight text-brand-900 sm:text-4xl">
            Sıkça sorulan sorular
          </h2>
          <div className="mt-12">
            <Faq />
          </div>
        </div>
      </section>

      {/* ---------- FINAL CTA ---------- */}
      <section className="border-t border-dark-border bg-dark-surface text-dark-foreground">
        <div className="mx-auto max-w-3xl px-6 py-24 text-center sm:py-32">
          <h2 className="text-3xl font-semibold tracking-tight sm:text-4xl">
            Bir sonraki case&apos;in burada başlıyor.
          </h2>
          <p className="mx-auto mt-4 max-w-md text-brand-400">
            Bir kere pratik yap. Sonra tekrar yap. Mülakata hazır şekilde gir.
          </p>
          <div className="mt-8 flex justify-center">
            <LinkButton href="/signup">Ücretsiz pratiğe başla</LinkButton>
          </div>
          <p className="mt-4 text-xs text-brand-400">Kredi kartı gerekmez.</p>
        </div>
      </section>
    </div>
  );
}
