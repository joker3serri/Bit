import { PaymentMethodType, PlanType } from "../../enums";

type Organization = {
  name: string;
  billingEmail: string;
  businessName?: string;
};

type Plan = {
  type: PlanType;
  passwordManagerSeats?: number;
  subscribeToSecretsManager?: boolean;
  isFromSecretsManagerTrial?: boolean;
  secretsManagerSeats?: number;
  secretsManagerServiceAccounts?: number;
  storage?: number;
};

type Payment = {
  paymentMethod: [string, PaymentMethodType];
  billing: {
    postalCode: string;
    country: string;
    taxId?: string;
    addressLine1?: string;
    addressLine2?: string;
    city?: string;
    state?: string;
  };
};

export type PurchaseOrganizationRequest = {
  organization: Organization;
  plan: Plan;
  payment: Payment;
};

export type StartFreeOrganizationRequest = {
  organization: Organization;
  plan?: Pick<Plan, "subscribeToSecretsManager" | "isFromSecretsManagerTrial">;
};
