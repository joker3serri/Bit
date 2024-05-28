import {
  VerifyBankAccountRequest,
  CreateClientOrganizationRequest,
  ExpandedTaxInfoUpdateRequest,
  TokenizedPaymentMethodRequest,
  UpdateClientOrganizationRequest,
} from "@bitwarden/common/billing/models/request";

import { ProviderSubscriptionResponse, PaymentInformationResponse } from "../../models/response";

export abstract class ProviderBillingClientAbstraction {
  createClientOrganization: (
    providerId: string,
    request: CreateClientOrganizationRequest,
  ) => Promise<void>;
  getPaymentInformation: (providerId: string) => Promise<PaymentInformationResponse>;
  getSubscription: (providerId: string) => Promise<ProviderSubscriptionResponse>;
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
