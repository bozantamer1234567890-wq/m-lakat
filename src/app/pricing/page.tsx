import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Card, Badge, LinkButton } from "@/components/ui";
import { FREE_SESSION_LIMIT, isProActive, isCoachActive, isBillingCycle, PLANS } from "@/lib/iyzico";

export default async function PricingPage({
  searchParams,
}: {
  searchParams: Promise<{ cycle?: string }>;
}) {
  const { cycle: cycleParam } = await searchParams;
  const cycle = isBillingCycle(cycleParam) ? cycleParam : "monthly";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let proActive = false;
  let coachActive = false;
  let currentPeriodEnd: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, current_period_end")
      .eq("id", user.id)
      .single();
    proActive = isProActive(profile);
    coachActive = isCoachActive(profile);
    currentPeriodEnd = profile?.current_period_end ?? null;
  }

  const pro = PLANS.pro[cycle];
  const coach = PLANS.coach[cycle];
  const suffix = cycle === "monthly" ? "/ay" : "/yıl";

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 text-center">
      <Badge>Basit fiyatlandırma</Badge>
      <h1 className="mt-4 text-3xl font-semibold text-brand-900">Hedefine uygun planı seç</h1>
      <p className="mt-3 text-brand-600">
        Ücretsiz {FREE_SESSION_LIMIT} mülakat hakkıyla dene, beğenirsen Pro veya Coach&apos;a geç.
      </p>

      <div className="mt-8 inline-flex rounded-full border border-border bg-surface p-1 text-sm">
        <Link
          href="/pricing?cycle=monthly"
          className={`rounded-full px-4 py-1.5 transition-colors ${
            cycle === "monthly" ? "bg-brand-500 text-white" : "text-brand-600"
          }`}
        >
          Aylık
        </Link>
        <Link
          href="/pricing?cycle=yearly"
          className={`rounded-full px-4 py-1.5 transition-colors ${
            cycle === "yearly" ? "bg-brand-500 text-white" : "text-brand-600"
          }`}
        >
          Yıllık — 2 ay hediye
        </Link>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <Card className="text-left">
          <h3 className="font-medium text-brand-900">Ücretsiz</h3>
          <p className="mt-1 text-xs text-brand-500">Prova&apos;yı keşfet</p>
          <p className="mt-3 text-3xl font-semibold text-brand-900">₺0</p>
          <ul className="mt-4 space-y-2 text-sm text-brand-600">
            <li>{FREE_SESSION_LIMIT} mülakat oturumu</li>
            <li>Yazılı pratik</li>
            <li>Temel geri bildirim</li>
          </ul>
        </Card>

        <Card className="border-brand-500 text-left">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-medium text-brand-900">Pro</h3>
              <p className="mt-1 text-xs text-brand-500">Ciddi hazırlık için</p>
            </div>
            <Badge>Önerilen</Badge>
          </div>
          <p className="mt-3 text-3xl font-semibold text-brand-900">
            ₺{pro.price.toLocaleString("tr-TR")}
            <span className="text-base font-normal text-brand-600">{suffix}</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-brand-600">
            <li>Sınırsız mülakat oturumu</li>
            <li>Sesli mülakatlar</li>
            <li>Gelişmiş geri bildirim</li>
            <li>İlerleme takibi</li>
            <li>Tüm case kütüphanesi</li>
          </ul>

          {proActive ? (
            <div className="mt-6">
              <p className="text-center text-sm text-brand-700">
                Aboneliğin {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString("tr-TR") : ""} tarihine
                kadar aktif.
              </p>
              <LinkButton href={`/checkout?tier=pro&cycle=${cycle}`} variant="secondary" className="mt-3 w-full">
                Erken yenile
              </LinkButton>
            </div>
          ) : (
            <LinkButton href={user ? `/checkout?tier=pro&cycle=${cycle}` : "/login"} className="mt-6 w-full">
              {user ? "Pro'ya geç" : "Giriş yap ve devam et"}
            </LinkButton>
          )}
        </Card>

        <Card className="text-left">
          <h3 className="font-medium text-brand-900">Coach</h3>
          <p className="mt-1 text-xs text-brand-500">Yoğun hazırlık için</p>
          <p className="mt-3 text-3xl font-semibold text-brand-900">
            ₺{coach.price.toLocaleString("tr-TR")}
            <span className="text-base font-normal text-brand-600">{suffix}</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-brand-600">
            <li>Pro&apos;daki her şey</li>
            <li>Gelişmiş AI mülakatçı</li>
            <li>Kişiselleştirilmiş pratik planı</li>
            <li>Detaylı performans analitiği</li>
          </ul>

          {coachActive ? (
            <div className="mt-6">
              <p className="text-center text-sm text-brand-700">
                Aboneliğin {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString("tr-TR") : ""} tarihine
                kadar aktif.
              </p>
              <LinkButton href={`/checkout?tier=coach&cycle=${cycle}`} variant="secondary" className="mt-3 w-full">
                Erken yenile
              </LinkButton>
            </div>
          ) : (
            <LinkButton
              href={user ? `/checkout?tier=coach&cycle=${cycle}` : "/login"}
              variant="secondary"
              className="mt-6 w-full"
            >
              {user ? "Coach'a geç" : "Giriş yap ve devam et"}
            </LinkButton>
          )}
        </Card>
      </div>
    </div>
  );
}
