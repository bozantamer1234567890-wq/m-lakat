import { createClient } from "@/lib/supabase/server";
import { Card, Badge, Button } from "@/components/ui";
import { startCheckout, openBillingPortal } from "@/app/pricing/actions";
import { FREE_SESSION_LIMIT } from "@/lib/stripe";

export default async function PricingPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let plan: "free" | "pro" | null = null;
  if (user) {
    const { data: profile } = await supabase.from("profiles").select("plan").eq("id", user.id).single();
    plan = (profile?.plan as "free" | "pro") ?? "free";
  }

  return (
    <div className="mx-auto max-w-3xl px-6 py-16 text-center">
      <Badge>Basit fiyatlandırma</Badge>
      <h1 className="mt-4 text-3xl font-semibold text-brand-900">Sınırsız pratik, tek plan</h1>
      <p className="mt-3 text-brand-600">
        Ücretsiz {FREE_SESSION_LIMIT} mülakat hakkıyla dene, beğenirsen Pro&apos;ya geç.
      </p>

      <div className="mt-10 grid gap-6 sm:grid-cols-2">
        <Card className="text-left">
          <h3 className="font-medium text-brand-900">Ücretsiz</h3>
          <p className="mt-2 text-3xl font-semibold text-brand-900">₺0</p>
          <ul className="mt-4 space-y-2 text-sm text-brand-600">
            <li>{FREE_SESSION_LIMIT} mülakat oturumu</li>
            <li>Yazılı ve sesli mod</li>
            <li>Temel geri bildirim raporu</li>
          </ul>
        </Card>

        <Card className="border-brand-400 text-left">
          <div className="flex items-center justify-between">
            <h3 className="font-medium text-brand-900">Pro</h3>
            <Badge>Önerilen</Badge>
          </div>
          <p className="mt-2 text-3xl font-semibold text-brand-900">
            ₺299<span className="text-base font-normal text-brand-600">/ay</span>
          </p>
          <ul className="mt-4 space-y-2 text-sm text-brand-600">
            <li>Sınırsız mülakat oturumu</li>
            <li>Tüm case kütüphanesi</li>
            <li>Detaylı geri bildirim ve ilerleme takibi</li>
            <li>İstediğin zaman iptal</li>
          </ul>

          {plan === "pro" ? (
            <form action={openBillingPortal} className="mt-6">
              <Button type="submit" className="w-full">
                Aboneliği yönet
              </Button>
            </form>
          ) : (
            <form action={startCheckout} className="mt-6">
              <Button type="submit" className="w-full">
                {user ? "Pro'ya geç" : "Giriş yap ve devam et"}
              </Button>
            </form>
          )}
        </Card>
      </div>
    </div>
  );
}
