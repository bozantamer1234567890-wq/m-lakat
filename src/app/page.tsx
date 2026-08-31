import { LinkButton, Card, Badge } from "@/components/ui";

const FEATURES = [
  {
    title: "Sesli AI mülakatçı",
    desc: "Gerçek bir mülakat gibi konuş; AI seni dinler ve sesli olarak yanıt verir.",
  },
  {
    title: "Yazılı hızlı pratik",
    desc: "İstersen tamamen yazarak, hızlıca case üzerinde çalış.",
  },
  {
    title: "4 aşamalı yapı",
    desc: "Açılış, strateji, analiz ve tavsiye aşamalarıyla gerçek mülakat akışı.",
  },
  {
    title: "Anında geri bildirim",
    desc: "Her oturum sonunda yapı, analiz ve iletişim puanların ile detaylı rapor.",
  },
];

export default function Home() {
  return (
    <div>
      <section className="mx-auto max-w-6xl px-6 pt-20 pb-16 text-center">
        <Badge>Danışmanlık mülakatlarına hazırlık</Badge>
        <h1 className="mt-6 text-4xl font-semibold tracking-tight text-brand-900 sm:text-5xl">
          Case interview&apos;lerinde <span className="text-brand-500">özgüvenle</span> parla
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-lg text-brand-700">
          Sesli veya yazılı AI mülakatçı ile gerçekçi case interview pratiği yap,
          anında geri bildirim al, ilerlemeni takip et.
        </p>
        <div className="mt-8 flex justify-center gap-3">
          <LinkButton href="/signup" variant="primary">
            Ücretsiz dene
          </LinkButton>
          <LinkButton href="/login" variant="secondary">
            Demo hesapla gir
          </LinkButton>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl grid-cols-1 gap-4 px-6 pb-24 sm:grid-cols-2 lg:grid-cols-4">
        {FEATURES.map((f) => (
          <Card key={f.title}>
            <h3 className="font-medium text-brand-900">{f.title}</h3>
            <p className="mt-2 text-sm text-brand-600">{f.desc}</p>
          </Card>
        ))}
      </section>
    </div>
  );
}
