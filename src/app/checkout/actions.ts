"use server";

import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { initializeSubscriptionCheckout, unwrap, PRICING_PLAN_REFERENCE_CODE } from "@/lib/iyzico";

export type CheckoutState = {
  error?: string;
  checkoutFormContent?: string;
};

export async function createSubscriptionCheckout(
  _prev: CheckoutState,
  formData: FormData
): Promise<CheckoutState> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const name = String(formData.get("name") ?? "");
  const surname = String(formData.get("surname") ?? "");
  const identityNumber = String(formData.get("identityNumber") ?? "");
  const gsmNumber = String(formData.get("gsmNumber") ?? "");
  const address = String(formData.get("address") ?? "");
  const city = String(formData.get("city") ?? "");
  const district = String(formData.get("district") ?? "");
  const zipCode = String(formData.get("zipCode") ?? "");

  if (!name || !surname || !identityNumber || !gsmNumber || !address || !city || !district || !zipCode) {
    return { error: "Lütfen tüm alanları doldur." };
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const billingAddress = { contactName: `${name} ${surname}`, city, district, country: "Turkey", address, zipCode };

  try {
    const result = unwrap(
      await initializeSubscriptionCheckout({
        locale: "tr",
        conversationId: user.id,
        callbackUrl: `${siteUrl}/api/iyzico/callback`,
        pricingPlanReferenceCode: PRICING_PLAN_REFERENCE_CODE,
        subscriptionInitialStatus: "ACTIVE",
        customer: {
          name,
          surname,
          identityNumber,
          email: user.email!,
          gsmNumber,
          billingAddress,
          shippingAddress: billingAddress,
        },
      })
    );

    if (result.status !== "success" || !result.checkoutFormContent) {
      return { error: result.errorMessage ?? "Ödeme formu başlatılamadı, tekrar dene." };
    }

    return { checkoutFormContent: result.checkoutFormContent };
  } catch {
    return { error: "iyzico ile bağlantı kurulamadı. Bilgileri kontrol edip tekrar dene." };
  }
}
