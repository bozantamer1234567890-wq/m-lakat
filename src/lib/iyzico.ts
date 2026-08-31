import Iyzipay from "iyzipay";

let client: Iyzipay | null = null;

export function getIyzipay() {
  if (!client) {
    client = new Iyzipay({
      apiKey: process.env.IYZICO_API_KEY!,
      secretKey: process.env.IYZICO_SECRET_KEY!,
      uri: process.env.IYZICO_URI || "https://sandbox-api.iyzipay.com",
    });
  }
  return client;
}

export const PRICING_PLAN_REFERENCE_CODE = process.env.IYZICO_PRICING_PLAN_REFERENCE_CODE!;
export const FREE_SESSION_LIMIT = 2;

export type ProfilePlanFields = {
  plan: "free" | "pro";
  current_period_end: string | null;
};

export function isProActive(profile: ProfilePlanFields | null | undefined) {
  if (!profile || profile.plan !== "pro") return false;
  if (!profile.current_period_end) return false;
  return new Date(profile.current_period_end).getTime() > Date.now();
}

type SubscriptionCheckoutFormInitializeRequest = {
  locale: string;
  conversationId: string;
  callbackUrl: string;
  pricingPlanReferenceCode: string;
  subscriptionInitialStatus: string;
  customer: {
    name: string;
    surname: string;
    identityNumber: string;
    email: string;
    gsmNumber: string;
    billingAddress: {
      contactName: string;
      city: string;
      district: string;
      country: string;
      address: string;
      zipCode: string;
    };
    shippingAddress: {
      contactName: string;
      city: string;
      district: string;
      country: string;
      address: string;
      zipCode: string;
    };
  };
};

type SubscriptionCheckoutFormResult = {
  status: string;
  errorMessage?: string;
  checkoutFormContent?: string;
  token?: string;
  tokenExpireTime?: number;
  data?: { checkoutFormContent?: string; token?: string; tokenExpireTime?: number };
};

export function initializeSubscriptionCheckout(
  request: SubscriptionCheckoutFormInitializeRequest
): Promise<SubscriptionCheckoutFormResult> {
  return new Promise((resolve, reject) => {
    getIyzipay().subscriptionCheckoutForm.initialize(request, (err: Error | null, result: SubscriptionCheckoutFormResult) => {
      if (err) reject(err);
      else resolve(result);
    });
  });
}

type SubscriptionCheckoutFormRetrieveResult = {
  status: string;
  errorMessage?: string;
  conversationId?: string;
  parentReferenceCode?: string;
  referenceCode?: string;
  customerReferenceCode?: string;
  pricingPlanReferenceCode?: string;
  subscriptionStatus?: string;
  data?: {
    parentReferenceCode?: string;
    referenceCode?: string;
    customerReferenceCode?: string;
    pricingPlanReferenceCode?: string;
    subscriptionStatus?: string;
  };
};

/** iyzico'nun bazı v2 uç noktaları alanları üst seviyede, bazıları `data` içinde döndürür — ikisini de dener. */
export function unwrap<T extends { data?: Partial<T> }>(result: T): T {
  return result.data ? { ...result, ...result.data } : result;
}

export function retrieveSubscriptionCheckout(
  checkoutFormToken: string
): Promise<SubscriptionCheckoutFormRetrieveResult> {
  return new Promise((resolve, reject) => {
    getIyzipay().subscriptionCheckoutForm.retrieve(
      { checkoutFormToken },
      (err: Error | null, result: SubscriptionCheckoutFormRetrieveResult) => {
        if (err) reject(err);
        else resolve(result);
      }
    );
  });
}
