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

export type BillingCycle = "monthly" | "yearly";
export type PlanTier = "pro" | "coach";

type PlanConfig = { referenceCode: string; price: number; listPrice: number };

// Fiyatlar gerçek maliyete göre belirlendi: bir kullanıcının aylık OpenAI (chat+whisper+tts)
// maliyeti Pro'da ~₺25-30, Coach'ta ~₺65-70 seviyesinde kalıyor (ağırlıkla sesli kullanımda
// bile) — yani bu fiyatlarda dahi %85+ brüt marj var. 2 ay bedava (yıllık = aylığın 10 katı):
// marjı korumak yerine dönüşümü artıracak bir indirim vermek daha kârlı.
// `price` = kampanya/lansman fiyatı (checkout'ta ve pricing sayfasında öne çıkan fiyat),
// `listPrice` = pricing sayfasında üzeri çizili gösterilen liste fiyatı (yanıltıcı bir "eski
// fiyat" değil, dürüst bir "liste fiyatı / kampanya fiyatı" hiyerarşisi için).
export const PLANS: Record<PlanTier, Record<BillingCycle, PlanConfig> & { label: string }> = {
  pro: {
    label: "Pro",
    monthly: { referenceCode: process.env.IYZICO_PRICING_PLAN_REFERENCE_CODE!, price: 399, listPrice: 499 },
    yearly: { referenceCode: process.env.IYZICO_PRICING_PLAN_REFERENCE_CODE_YEARLY!, price: 3990, listPrice: 4990 },
  },
  coach: {
    label: "Coach",
    monthly: {
      referenceCode: process.env.IYZICO_PRICING_PLAN_REFERENCE_CODE_COACH_MONTHLY!,
      price: 699,
      listPrice: 899,
    },
    yearly: {
      referenceCode: process.env.IYZICO_PRICING_PLAN_REFERENCE_CODE_COACH_YEARLY!,
      price: 6990,
      listPrice: 8990,
    },
  },
};

export function isBillingCycle(value: unknown): value is BillingCycle {
  return value === "monthly" || value === "yearly";
}

export function isPlanTier(value: unknown): value is PlanTier {
  return value === "pro" || value === "coach";
}

export function planTierByReferenceCode(referenceCode: string | undefined): PlanTier | null {
  if (!referenceCode) return null;
  for (const tier of Object.keys(PLANS) as PlanTier[]) {
    if (PLANS[tier].monthly.referenceCode === referenceCode) return tier;
    if (PLANS[tier].yearly.referenceCode === referenceCode) return tier;
  }
  return null;
}

export function billingCycleByReferenceCode(referenceCode: string | undefined): BillingCycle {
  if (!referenceCode) return "monthly";
  for (const tier of Object.keys(PLANS) as PlanTier[]) {
    if (PLANS[tier].yearly.referenceCode === referenceCode) return "yearly";
  }
  return "monthly";
}

export const FREE_SESSION_LIMIT = 2;

export type ProfilePlanFields = {
  plan: "free" | "pro" | "coach";
  current_period_end: string | null;
};

export function isProActive(profile: ProfilePlanFields | null | undefined) {
  if (!profile || (profile.plan !== "pro" && profile.plan !== "coach")) return false;
  if (!profile.current_period_end) return false;
  return new Date(profile.current_period_end).getTime() > Date.now();
}

export function isCoachActive(profile: ProfilePlanFields | null | undefined) {
  if (!profile || profile.plan !== "coach") return false;
  if (!profile.current_period_end) return false;
  return new Date(profile.current_period_end).getTime() > Date.now();
}

/** Bir case'in min_plan gereksinimini kullanıcının aktif planına göre kontrol eder (Case Library kilidi). */
export function hasCasePlanAccess(
  profile: ProfilePlanFields | null | undefined,
  minPlan: "free" | "pro" | "coach"
) {
  if (minPlan === "free") return true;
  if (minPlan === "pro") return isProActive(profile) || isCoachActive(profile);
  return isCoachActive(profile);
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
