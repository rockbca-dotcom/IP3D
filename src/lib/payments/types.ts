export interface CheckoutItemInput {
  productId: string;
  quantity: number;
}

export interface CheckoutCustomer {
  name: string;
  email: string;
  phone?: string;
}

export interface CheckoutShipping {
  cep: string;
  serviceCode: string;
  serviceName: string;
  deliveryDays: number;
  price: number;
  address: {
    street: string;
    neighborhood: string;
    city: string;
    state: string;
    number: string;
    complement?: string | null;
  };
}

export interface CheckoutPayload {
  items: CheckoutItemInput[];
  customer: CheckoutCustomer;
  shipping: CheckoutShipping;
}

export interface PreparedOrderItem {
  product: {
    id: string;
    name: string;
    slug: string;
  };
  quantity: number;
  unitPrice: number;
  lineTotal: number;
}

export interface PreparedCheckoutOrder {
  id: string;
  code: string;
  subtotal: number;
  shippingCost: number;
  total: number;
}

export interface PreparedCheckout {
  order: PreparedCheckoutOrder;
  items: PreparedOrderItem[];
  customer: CheckoutCustomer;
  shipping: CheckoutShipping;
  siteUrl: string;
}

export interface ProviderCheckoutResponse {
  redirectUrl: string;
  providerOrderId?: string | null;
}

export interface PaymentProvider {
  createCheckout(input: PreparedCheckout): Promise<ProviderCheckoutResponse>;
}
