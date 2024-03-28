import { ProviderSubscriptionUpdateRequest } from "../../admin-console/models/request/provider/provider-subscription-update.request";
import { ProviderSubscriptionResponse } from "../../admin-console/models/response/provider/provider-subscription.response";
import { SubscriptionCancellationRequest } from "../../billing/models/request/subscription-cancellation.request";
import { OrganizationBillingStatusResponse } from "../../billing/models/response/organization-billing-status.response";

export abstract class BillingApiServiceAbstraction {
  cancelOrganizationSubscription: (
    organizationId: string,
    request: SubscriptionCancellationRequest,
  ) => Promise<void>;
  cancelPremiumUserSubscription: (request: SubscriptionCancellationRequest) => Promise<void>;
  getBillingStatus: (id: string) => Promise<OrganizationBillingStatusResponse>;
  getProviderClientSubscriptions: (providerId: string) => Promise<ProviderSubscriptionResponse>;
  putProviderClientSubscriptions: (
    providerId: string,
    organizationId: string,
    request: ProviderSubscriptionUpdateRequest,
  ) => Promise<any>;
}
