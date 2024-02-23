import { ApiService } from "../../abstractions/api.service";
import { SubscriptionCancellationRequest } from "../models/request/subscription-cancellation.request";
import { SubscriptionResponse } from "../models/response/new-subscription.response";

export class OrganizationBillingApiClient {
  constructor(private apiService: ApiService) {}

  cancelSubscription(
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

  async getSubscription(organizationId: string): Promise<SubscriptionResponse> {
    const response = await this.apiService.send(
      "GET",
      `/organizations/${organizationId}/billing/subscription`,
      null,
      true,
      true,
    );

    return new SubscriptionResponse(response);
  }
}
