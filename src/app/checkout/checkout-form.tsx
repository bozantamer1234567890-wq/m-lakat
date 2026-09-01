"use client";

import { useActionState, useEffect, useRef } from "react";
import { createSubscriptionCheckout, type CheckoutState } from "@/app/checkout/actions";
import { Button, Card } from "@/components/ui";
import type { BillingCycle, PlanTier } from "@/lib/iyzico";

const initialState: CheckoutState = {};

export function CheckoutForm({
  tier,
  cycle,
  price,
  tierLabel,
  cycleLabel,
}: {
  tier: PlanTier;
  cycle: BillingCycle;
  price: number;
  tierLabel: string;
  cycleLabel: string;
}) {
  const [state, formAction, isPending] = useActionState(createSubscriptionCheckout, initialState);
  const formContentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!state.checkoutFormContent || !formContentRef.current) return;
    // iyzico'nun checkoutFormContent'i bir <script> içerir; innerHTML ile eklenen script'ler
    // çalışmadığından elle yeniden oluşturup DOM'a ekliyoruz.
    const container = formContentRef.current;
    container.innerHTML = "";
    const temp = document.createElement("div");
    temp.innerHTML = state.checkoutFormContent;
    Array.from(temp.childNodes).forEach((node) => {
      if (node.nodeName === "SCRIPT") {
        const script = document.createElement("script");
        Array.from((node as HTMLScriptElement).attributes).forEach((attr) =>
          script.setAttribute(attr.name, attr.value)
        );
        script.text = (node as HTMLScriptElement).text;
        container.appendChild(script);
      } else {
        container.appendChild(node.cloneNode(true));
      }
    });
  }, [state.checkoutFormContent]);

  if (state.checkoutFormContent) {
    return (
      <Card>
        <div id="iyzipay-checkout-form" ref={formContentRef} className="responsive" />
      </Card>
    );
  }

  return (
    <Card>
      <form action={formAction} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <input type="hidden" name="cycle" value={cycle} />
        <input type="hidden" name="tier" value={tier} />
        <p className="sm:col-span-2 rounded-lg bg-brand-50 px-3 py-2 text-sm text-brand-700">
          Seçilen plan: <strong>Prova {tierLabel} ({cycleLabel})</strong> — ₺{price.toLocaleString("tr-TR")}
          {cycle === "monthly" ? "/ay" : "/yıl"}
        </p>
        {state.error && (
          <p className="sm:col-span-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{state.error}</p>
        )}
        <label className="flex flex-col gap-1 text-sm">
          Ad
          <input name="name" required className="rounded-lg border border-border bg-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Soyad
          <input name="surname" required className="rounded-lg border border-border bg-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          TC Kimlik No
          <input name="identityNumber" required maxLength={11} className="rounded-lg border border-border bg-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Telefon
          <input name="gsmNumber" required placeholder="+905551234567" className="rounded-lg border border-border bg-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm sm:col-span-2">
          Adres
          <input name="address" required className="rounded-lg border border-border bg-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Şehir
          <input name="city" required className="rounded-lg border border-border bg-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          İlçe
          <input name="district" required className="rounded-lg border border-border bg-background px-3 py-2" />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Posta kodu
          <input name="zipCode" required className="rounded-lg border border-border bg-background px-3 py-2" />
        </label>
        <Button type="submit" disabled={isPending} className="sm:col-span-2">
          {isPending ? "Hazırlanıyor…" : "Ödemeye geç"}
        </Button>
      </form>
    </Card>
  );
}
