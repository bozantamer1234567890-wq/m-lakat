import { NextResponse } from "next/server";
import { retrieveSubscriptionCheckout, unwrap } from "@/lib/iyzico";
import { createAdminClient } from "@/lib/supabase/admin";

function addOneMonth(date: Date) {
  const result = new Date(date);
  result.setMonth(result.getMonth() + 1);
  return result;
}

export async function POST(req: Request) {
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  const formData = await req.formData();
  const token = String(formData.get("token") ?? "");

  if (!token) {
    return NextResponse.redirect(`${siteUrl}/pricing?error=missing_token`);
  }

  try {
    const result = unwrap(await retrieveSubscriptionCheckout(token));

    if (result.status !== "success") {
      return NextResponse.redirect(`${siteUrl}/pricing?error=payment_failed`);
    }

    // conversationId, checkout başlatılırken user.id olarak gönderilmişti.
    const userId = result.conversationId;
    const currentPeriodEnd = addOneMonth(new Date()).toISOString();

    const supabase = createAdminClient();

    if (userId) {
      await supabase
        .from("profiles")
        .update({ plan: "pro", current_period_end: currentPeriodEnd })
        .eq("id", userId);

      await supabase.from("payments").insert({
        user_id: userId,
        subscription_reference_code: result.referenceCode ?? null,
        pricing_plan_reference_code: result.pricingPlanReferenceCode ?? null,
        status: result.status,
        raw: result,
      });
    }

    return NextResponse.redirect(`${siteUrl}/dashboard?upgraded=1`);
  } catch {
    return NextResponse.redirect(`${siteUrl}/pricing?error=verification_failed`);
  }
}

export async function GET(req: Request) {
  return POST(req);
}
