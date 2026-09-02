import { Card, Badge, LinkButton } from "@/components/ui";
import type { PricingPlanContent } from "@/lib/pricing-content";

export type PricingCardPrice =
  | { kind: "free" }
  | {
      kind: "paid";
      price: number;
      listPrice: number | null;
      suffix: string;
      campaignLabel: string;
      note?: string;
      yearlyBadge?: string;
    };

export type PricingCardCta =
  | { kind: "link"; href: string; label: string; variant: "primary" | "secondary" }
  | { kind: "active"; periodEndLabel: string; renewHref: string }
  | { kind: "note"; label: string };

function formatTL(value: number) {
  return `₺${value.toLocaleString("tr-TR")}`;
}

export function PricingCard({
  content,
  price,
  cta,
}: {
  content: PricingPlanContent;
  price: PricingCardPrice;
  cta: PricingCardCta;
}) {
  const featured = content.id === "pro";

  return (
    <Card
      className={`flex h-full flex-col text-left ${featured ? "border-brand-500 shadow-md" : ""}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div>
          <h3 className="font-medium text-brand-900">{content.name}</h3>
          <p className="mt-0.5 text-xs text-brand-500">{content.subtitle}</p>
        </div>
        {content.badge && <Badge>{content.badge}</Badge>}
      </div>

      <p className="mt-3 text-sm text-brand-600">{content.tagline}</p>

      <div className="mt-4">
        {price.kind === "free" ? (
          <p className="text-3xl font-semibold text-brand-900">₺0</p>
        ) : (
          <>
            <div className="flex flex-wrap items-baseline gap-2">
              {price.listPrice && (
                <span className="text-base text-brand-400 line-through">{formatTL(price.listPrice)}</span>
              )}
              <span className="text-3xl font-semibold text-brand-900">
                {formatTL(price.price)}
                <span className="text-base font-normal text-brand-600">{price.suffix}</span>
              </span>
            </div>
            <p className="mt-1 text-xs font-medium text-brand-500">{price.campaignLabel}</p>
            {price.note && <p className="mt-1 text-xs text-brand-500">{price.note}</p>}
            {price.yearlyBadge && (
              <span className="mt-2 inline-block rounded-full bg-accent-soft px-2.5 py-1 text-xs font-medium text-success">
                {price.yearlyBadge}
              </span>
            )}
          </>
        )}
      </div>

      <ul className="mt-5 flex flex-col gap-2 text-sm text-brand-600">
        {content.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2">
            <span className="mt-0.5 text-brand-500" aria-hidden>
              ✓
            </span>
            <span>{feature}</span>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex-1" />

      <div className="mt-6">
        {cta.kind === "note" ? (
          <p className="rounded-lg bg-surface-muted px-4 py-2.5 text-center text-sm text-brand-600">
            {cta.label}
          </p>
        ) : cta.kind === "active" ? (
          <div>
            <p className="text-center text-sm text-brand-700">
              Aboneliğin {cta.periodEndLabel} tarihine kadar aktif.
            </p>
            <LinkButton href={cta.renewHref} variant="secondary" className="mt-3 w-full">
              Erken yenile
            </LinkButton>
          </div>
        ) : (
          <LinkButton href={cta.href} variant={cta.variant} className="w-full">
            {cta.label}
          </LinkButton>
        )}
      </div>
    </Card>
  );
}
