import { Observable } from "rxjs";

import { OrganizationResponse } from "../../admin-console/models/response/organization.response";
import { SubscriptionInformation } from "../models/domain/subscription-information";
import { BillingResponse } from "../models/response/billing.response";

export abstract class OrganizationBillingServiceAbstraction {
  organizationBilling$: Observable<Record<string, BillingResponse>>;
  purchaseSubscription: (subscription: SubscriptionInformation) => Promise<OrganizationResponse>;
  setOrganizationBilling: (organizationId: string, billing: BillingResponse) => Promise<void>;
  startFree: (subscription: SubscriptionInformation) => Promise<OrganizationResponse>;
}
