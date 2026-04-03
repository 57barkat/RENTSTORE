declare module "@sfpy/node-sdk" {
  interface SafepayOptions {
    environment: "sandbox" | "production";
    apiKey: string;
    v1Secret: string;
  }

  interface Customer {
    first_name: string;
    last_name: string;
    email: string;
    phone_number: string;
    country: string;
    is_guest?: boolean;
  }

  interface CheckoutParams {
    amount: number;
    currency: string;
    intent: string;
    mode: string;
    customer: Customer;
  }

  interface CheckoutResponse {
    url: string;
    id: string;
  }

  interface SafepayInstance {
    checkout: {
      create(params: CheckoutParams): Promise<CheckoutResponse>;
    };
  }

  function Safepay(options: SafepayOptions): SafepayInstance;
  export = Safepay;
}
