import Stripe from "stripe";

let client: Stripe | null = null;

export function getStripe() {
  if (!client) {
    client = new Stripe(process.env.STRIPE_SECRET_KEY!);
  }
  return client;
}

export const PRO_PRICE_ID = process.env.STRIPE_PRO_PRICE_ID!;
export const FREE_SESSION_LIMIT = 2;
