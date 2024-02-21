import { SubscriptionCancellationRequest } from "../../billing/models/request/subscription-cancellation.request";
import { SubscriptionResponse } from "../../billing/models/response/new-subscription.response";

export abstract class BillingApiServiceAbstraction {
  cancelOrganizationSubscription: (
    organizationId: string,
    request: SubscriptionCancellationRequest,
  ) => Promise<void>;
  cancelPremiumUserSubscription: (request: SubscriptionCancellationRequest) => Promise<void>;
  getOrganizationSubscription: (organizationId: string) => Promise<SubscriptionResponse>;
}
