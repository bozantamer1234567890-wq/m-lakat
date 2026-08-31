declare module "iyzipay" {
  type IyzipayCallback<T> = (err: Error | null, result: T) => void;

  interface IyzipayResourceMethods {
    initialize<T = unknown>(params: unknown, cb: IyzipayCallback<T>): void;
    retrieve<T = unknown>(params: unknown, cb: IyzipayCallback<T>): void;
    create<T = unknown>(params: unknown, cb: IyzipayCallback<T>): void;
  }

  export default class Iyzipay {
    constructor(config: { apiKey: string; secretKey: string; uri: string });
    subscriptionCheckoutForm: IyzipayResourceMethods;
    subscriptionProduct: IyzipayResourceMethods;
    subscriptionPricingPlan: IyzipayResourceMethods;
    subscription: IyzipayResourceMethods;
  }
}
