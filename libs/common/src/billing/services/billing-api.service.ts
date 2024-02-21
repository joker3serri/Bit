import { ApiService } from "../../abstractions/api.service";
import { BillingApiServiceAbstraction } from "../../billing/abstractions/billilng-api.service.abstraction";
import { SubscriptionCancellationRequest } from "../../billing/models/request/subscription-cancellation.request";
import { SubscriptionResponse } from "../../billing/models/response/new-subscription.response";

export class BillingApiService implements BillingApiServiceAbstraction {
  constructor(private apiService: ApiService) {}

  cancelOrganizationSubscription(
    organizationId: string,
    request: SubscriptionCancellationRequest,
  ): Promise<void> {
    return this.apiService.send(
      "POST",
      "/organizations/" + organizationId + "/churn",
      request,
      true,
      false,
    );
  }

  cancelPremiumUserSubscription(request: SubscriptionCancellationRequest): Promise<void> {
    return this.apiService.send("POST", "/accounts/churn-premium", request, true, false);
  }

  async getOrganizationSubscription(organizationId: string): Promise<SubscriptionResponse> {
    const response = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/subscription",
      null,
      true,
      true,
    );

    return new SubscriptionResponse(response);
  }
}
