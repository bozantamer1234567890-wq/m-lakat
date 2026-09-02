import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Badge } from "@/components/ui";
import { FREE_SESSION_LIMIT, isProActive, isCoachActive, isBillingCycle, PLANS, type PlanTier } from "@/lib/iyzico";
import { PRICING_PLANS_CONTENT } from "@/lib/pricing-content";
import { PricingCard, type PricingCardCta, type PricingCardPrice } from "@/components/marketing/pricing-card";
import { PricingComparisonTable } from "@/components/marketing/pricing-comparison-table";

function paidPrice(tier: PlanTier, cycle: "monthly" | "yearly"): PricingCardPrice {
  const plan = PLANS[tier][cycle];
  if (cycle === "monthly") {
    return {
      kind: "paid",
      price: plan.price,
      listPrice: plan.listPrice,
      suffix: "/ay",
      campaignLabel: "Kampanya fiyatı",
    };
  }
  const monthlyEquivalent = Math.round(plan.price / 12);
  return {
    kind: "paid",
    price: plan.price,
    listPrice: null,
    suffix: "/yıl",
    campaignLabel: "Kampanya fiyatı",
    note: `Ayda ₺${monthlyEquivalent.toLocaleString("tr-TR")}'a denk gelir`,
    yearlyBadge: "Yıllık plan — 2 ay hediye",
  };
}

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

  const periodEndLabel = currentPeriodEnd ? new Date(currentPeriodEnd).toLocaleDateString("tr-TR") : "";

  const freeContent = PRICING_PLANS_CONTENT.find((p) => p.id === "free")!;
  const proContent = PRICING_PLANS_CONTENT.find((p) => p.id === "pro")!;
  const coachContent = PRICING_PLANS_CONTENT.find((p) => p.id === "coach")!;

  const freeCta: PricingCardCta = !user
    ? { kind: "link", href: "/signup", label: freeContent.ctaLabel, variant: "secondary" }
    : proActive
      ? { kind: "note", label: "Pro kullanıyorsun" }
      : coachActive
        ? { kind: "note", label: "Coach kullanıyorsun" }
        : { kind: "note", label: "Mevcut planın" };

  const proCta: PricingCardCta = proActive
    ? { kind: "active", periodEndLabel, renewHref: `/checkout?tier=pro&cycle=${cycle}` }
    : {
        kind: "link",
        href: user ? `/checkout?tier=pro&cycle=${cycle}` : "/login",
        label: user ? proContent.ctaLabel : "Giriş yap ve devam et",
        variant: "primary",
      };

  const coachCta: PricingCardCta = coachActive
    ? { kind: "active", periodEndLabel, renewHref: `/checkout?tier=coach&cycle=${cycle}` }
    : {
        kind: "link",
        href: user ? `/checkout?tier=coach&cycle=${cycle}` : "/login",
        label: user ? coachContent.ctaLabel : "Giriş yap ve devam et",
        variant: "secondary",
      };

  return (
    <div className="mx-auto max-w-5xl px-6 py-16 text-center">
      <Badge>Basit fiyatlandırma</Badge>
      <h1 className="mt-4 text-3xl font-semibold text-brand-900 sm:text-4xl">
        Bir sonraki case mülakatına hazır ol.
      </h1>
      <p className="mx-auto mt-3 max-w-xl text-brand-600">
        Gerçekçi AI mülakatlarıyla pratik yap, performansını ölç ve eksiklerini sistematik olarak geliştir.
      </p>
      <p className="mt-2 text-sm font-medium text-brand-500">İlk {FREE_SESSION_LIMIT} mülakat ücretsiz.</p>

      <div className="mt-8 inline-flex rounded-full border border-border bg-surface p-1 text-sm">
        <Link
          href="/pricing?cycle=monthly"
          aria-current={cycle === "monthly" ? "true" : undefined}
          className={`rounded-full px-4 py-1.5 transition-colors ${
            cycle === "monthly" ? "bg-brand-500 text-white" : "text-brand-600"
          }`}
        >
          Aylık
        </Link>
        <Link
          href="/pricing?cycle=yearly"
          aria-current={cycle === "yearly" ? "true" : undefined}
          className={`rounded-full px-4 py-1.5 transition-colors ${
            cycle === "yearly" ? "bg-brand-500 text-white" : "text-brand-600"
          }`}
        >
          Yıllık · 2 ay hediye
        </Link>
      </div>

      <div className="mt-10 grid items-stretch gap-6 sm:grid-cols-3">
        <div className="order-3 sm:order-1">
          <PricingCard content={freeContent} price={{ kind: "free" }} cta={freeCta} />
        </div>
        <div className="order-1 sm:order-2">
          <PricingCard content={proContent} price={paidPrice("pro", cycle)} cta={proCta} />
        </div>
        <div className="order-2 sm:order-3">
          <PricingCard content={coachContent} price={paidPrice("coach", cycle)} cta={coachCta} />
        </div>
      </div>

      <PricingComparisonTable />

      <div className="mx-auto mt-16 max-w-md border-t border-border pt-8">
        <p className="text-sm font-medium text-brand-700">Karar vermek için acele etme.</p>
        <p className="mt-1 text-sm text-brand-500">
          İlk {FREE_SESSION_LIMIT} mülakat ücretsiz. Prova&apos;yı deneyerek kendi performansını gör.
        </p>
      </div>
    </div>
  );
}
