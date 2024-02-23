import { ApiService } from "../../abstractions/api.service";
import { SubscriptionCancellationRequest } from "../models/request/subscription-cancellation.request";

export class UserBillingApiClient {
  constructor(private apiService: ApiService) {}

  cancelSubscription(request: SubscriptionCancellationRequest): Promise<void> {
    return this.apiService.send("POST", "/accounts/churn-premium", request, true, false);
  }
}
