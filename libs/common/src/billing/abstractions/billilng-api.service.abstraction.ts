import { PaymentMethodType } from "@bitwarden/common/billing/enums";
import { UpdateProviderPaymentRequest } from "@bitwarden/common/billing/models/request/update-provider-payment.request";

import { SubscriptionCancellationRequest } from "../../billing/models/request/subscription-cancellation.request";
import { OrganizationBillingMetadataResponse } from "../../billing/models/response/organization-billing-metadata.response";
import { OrganizationBillingStatusResponse } from "../../billing/models/response/organization-billing-status.response";
import { OrganizationSubscriptionResponse } from "../../billing/models/response/organization-subscription.response";
import { PlanResponse } from "../../billing/models/response/plan.response";
import { ListResponse } from "../../models/response/list.response";
import { CreateClientOrganizationRequest } from "../models/request/create-client-organization.request";
import { UpdateClientOrganizationRequest } from "../models/request/update-client-organization.request";
import { ProviderSubscriptionResponse } from "../models/response/provider-subscription-response";

export abstract class BillingApiServiceAbstraction {
  cancelOrganizationSubscription: (
    organizationId: string,
    request: SubscriptionCancellationRequest,
  ) => Promise<void>;
  cancelPremiumUserSubscription: (request: SubscriptionCancellationRequest) => Promise<void>;
  createClientOrganization: (
    providerId: string,
    request: CreateClientOrganizationRequest,
  ) => Promise<void>;
  createSetupIntent: (paymentMethodType: PaymentMethodType) => Promise<string>;
  createSetupIntentForProvider: (providerId: string, type: PaymentMethodType) => Promise<string>;
  getBillingStatus: (id: string) => Promise<OrganizationBillingStatusResponse>;
  getOrganizationBillingMetadata: (
    organizationId: string,
  ) => Promise<OrganizationBillingMetadataResponse>;
  getOrganizationSubscription: (
    organizationId: string,
  ) => Promise<OrganizationSubscriptionResponse>;
  getPlans: () => Promise<ListResponse<PlanResponse>>;
  getProviderSubscription: (providerId: string) => Promise<ProviderSubscriptionResponse>;
  updateClientOrganization: (
    providerId: string,
    organizationId: string,
    request: UpdateClientOrganizationRequest,
  ) => Promise<any>;
  updateProviderPayment: (
    providerId: string,
    request: UpdateProviderPaymentRequest,
  ) => Promise<void>;
  verifyProviderMicroDeposit: (providerId: string) => Promise<void>;
}
