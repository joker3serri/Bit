import {
  VerifyBankAccountRequest,
  CreateClientOrganizationRequest,
  ExpandedTaxInfoUpdateRequest,
  TokenizedPaymentMethodRequest,
  UpdateClientOrganizationRequest,
} from "@bitwarden/common/billing/models/request";

import {
  ProviderSubscriptionResponse,
  PaymentMethodResponse,
  TaxInfoResponse,
} from "../../models/response";

export abstract class ProviderBillingClientAbstraction {
  createClientOrganization: (
    providerId: string,
    request: CreateClientOrganizationRequest,
  ) => Promise<void>;
  getPaymentMethod: (providerId: string) => Promise<PaymentMethodResponse | null>;
  getSubscription: (providerId: string) => Promise<ProviderSubscriptionResponse>;
  getTaxInformation: (providerId: string) => Promise<TaxInfoResponse | null>;
  updateClientOrganization: (
    providerId: string,
    organizationId: string,
    request: UpdateClientOrganizationRequest,
  ) => Promise<any>;
  updatePaymentMethod: (
    providerId: string,
    request: TokenizedPaymentMethodRequest,
  ) => Promise<void>;
  updateTaxInformation: (
    providerId: string,
    request: ExpandedTaxInfoUpdateRequest,
  ) => Promise<void>;
  verifyBankAccount: (providerId: string, request: VerifyBankAccountRequest) => Promise<void>;
}
