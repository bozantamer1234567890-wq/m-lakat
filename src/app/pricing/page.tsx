import { createClient } from "@/lib/supabase/server";
import { Card, Badge, LinkButton } from "@/components/ui";
import { FREE_SESSION_LIMIT, isProActive, PLANS } from "@/lib/iyzico";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let proActive = false;
  let currentPeriodEnd: string | null = null;
  if (user) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, current_period_end")
      .eq("id", user.id)
      .single();
    proActive = isProActive(profile);
    currentPeriodEnd = profile?.current_period_end ?? null;
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <Badge>Basit fiyatlandırma</Badge>
      <h1 className="mt-4 text-3xl font-semibold text-brand-900">Sınırsız pratik, tek plan</h1>
      <p className="mt-3 text-brand-600">
        Ücretsiz {FREE_SESSION_LIMIT} mülakat hakkıyla dene, beğenirsen Pro&apos;ya geç.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-3">
        <Card className="text-left">
          <h3 className="font-medium text-brand-900">Ücretsiz</h3>
          <p className="mt-2 text-3xl font-semibold text-brand-900">₺0</p>
          <ul className="mt-4 space-y-2 text-sm text-brand-600">
            <li>{FREE_SESSION_LIMIT} mülakat oturumu</li>
            <li>Yazılı ve sesli mod</li>
            <li>Temel geri bildirim raporu</li>
          </ul>
        </Card>

        <Card className="text-left">
          <h3 className="font-medium text-brand-900">Pro Aylık</h3>
          <p className="mt-2 text-3xl font-semibold text-brand-900">
            ₺{PLANS.monthly.price}
            <span className="text-base font-normal text-brand-600">/ay</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-brand-600">
            <li>Sınırsız mülakat oturumu</li>
            <li>Tüm case kütüphanesi</li>
            <li>Detaylı geri bildirim ve ilerleme takibi</li>
          </ul>

          {proActive ? (
            <div className="mt-6">
              <p className="text-center text-sm text-brand-700">
                Aboneliğin {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString("tr-TR") : ""} tarihine
                kadar aktif.
              </p>
              <LinkButton href="/checkout?cycle=monthly" variant="secondary" className="mt-3 w-full">
                Erken yenile
              </LinkButton>
            </div>
          ) : (
            <LinkButton href={user ? "/checkout?cycle=monthly" : "/login"} variant="secondary" className="mt-6 w-full">
              {user ? "Aylık başla" : "Giriş yap ve devam et"}
            </LinkButton>
          )}
        </Card>

        <Card className="border-brand-400 text-left">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-brand-900">Pro Yıllık</h3>
            <Badge>2 ay hediye</Badge>
          </div>
          <p className="mt-2 text-3xl font-semibold text-brand-900">
            ₺{PLANS.yearly.price.toLocaleString("tr-TR")}
            <span className="text-base font-normal text-brand-600">/yıl</span>
          </p>
          <p className="mt-1 text-xs text-brand-600">
            Aylık ₺{Math.round(PLANS.yearly.price / 12)}&apos;a denk gelir — aylık plana göre %
            {Math.round((1 - PLANS.yearly.price / (PLANS.monthly.price * 12)) * 100)} avantajlı.
          </p>
          <ul className="mt-4 space-y-2 text-sm text-brand-600">
            <li>Sınırsız mülakat oturumu</li>
            <li>Tüm case kütüphanesi</li>
            <li>Detaylı geri bildirim ve ilerleme takibi</li>
            <li>iyzico ile güvenli ödeme</li>
          </ul>

          {proActive ? (
            <div className="mt-6">
              <p className="text-center text-sm text-brand-700">
                Aboneliğin {currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString("tr-TR") : ""} tarihine
                kadar aktif.
              </p>
              <LinkButton href="/checkout?cycle=yearly" variant="secondary" className="mt-3 w-full">
                Erken yenile
              </LinkButton>
            </div>
          ) : (
            <LinkButton href={user ? "/checkout?cycle=yearly" : "/login"} className="mt-6 w-full">
              {user ? "Yıllık başla" : "Giriş yap ve devam et"}
            </LinkButton>
          )}
        </Card>
      </div>
    </div>
  );
}
