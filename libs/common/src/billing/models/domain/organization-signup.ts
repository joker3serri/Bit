import { PaymentMethodType, PlanType } from "../../enums";

type BasicOrganizationInformation = {
  name: string;
  billingEmail: string;
  businessName?: string;
};

export type PaidOrganizationSignup = {
  organization: BasicOrganizationInformation;
  plan: {
    type: PlanType;
    passwordManagerSeats?: number;
    subscribeToSecretsManager?: boolean;
    isFromSecretsManagerTrial?: boolean;
    secretsManagerSeats?: number;
    secretsManagerServiceAccounts?: number;
    storage?: number;
  };
  payment: {
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
};

export type FreeOrganizationSignup = {
  organization: BasicOrganizationInformation;
  plan?: {
    subscribeToSecretsManager: boolean;
    isFromSecretsManagerTrial?: boolean;
  };
};
