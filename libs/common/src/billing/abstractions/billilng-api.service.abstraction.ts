import { PaymentMethodType } from "@bitwarden/common/billing/enums";

import { ListResponse } from "../../models/response/list.response";
import { SubscriptionCancellationRequest } from "../models/request";
import {
  OrganizationBillingMetadataResponse,
  OrganizationBillingStatusResponse,
  PlanResponse,
} from "../models/response";

export abstract class BillingApiServiceAbstraction {
  cancelOrganizationSubscription: (
    organizationId: string,
    request: SubscriptionCancellationRequest,
  ) => Promise<void>;
  cancelPremiumUserSubscription: (request: SubscriptionCancellationRequest) => Promise<void>;
  createSetupIntent: (paymentMethodType: PaymentMethodType) => Promise<string>;
  getBillingStatus: (id: string) => Promise<OrganizationBillingStatusResponse>;
  getOrganizationBillingMetadata: (
    organizationId: string,
  ) => Promise<OrganizationBillingMetadataResponse>;
  getPlans: () => Promise<ListResponse<PlanResponse>>;
}
