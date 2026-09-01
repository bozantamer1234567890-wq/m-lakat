import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui";
import { CheckoutForm } from "@/app/checkout/checkout-form";
import { PLANS, isBillingCycle, isPlanTier } from "@/lib/iyzico";

const CYCLE_LABELS = { monthly: "Aylık", yearly: "Yıllık" } as const;

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ cycle?: string; tier?: string }>;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { cycle: cycleParam, tier: tierParam } = await searchParams;
  const cycle = isBillingCycle(cycleParam) ? cycleParam : "monthly";
  const tier = isPlanTier(tierParam) ? tierParam : "pro";
  const plan = PLANS[tier][cycle];

  return (
    <div className="mx-auto max-w-lg px-6 py-12">
      <Badge>Prova {PLANS[tier].label}</Badge>
      <h1 className="mt-3 text-2xl font-semibold text-brand-900">Aboneliğini tamamla</h1>
      <p className="mt-2 text-sm text-brand-600">
        Ödeme bilgilerini iyzico&apos;nun güvenli formu üzerinden gireceksin. Kart bilgilerin bizden geçmez.
      </p>
      <div className="mt-6">
        <CheckoutForm
          tier={tier}
          cycle={cycle}
          price={plan.price}
          tierLabel={PLANS[tier].label}
          cycleLabel={CYCLE_LABELS[cycle]}
        />
      </div>
    </div>
  );
}
