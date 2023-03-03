import { OrganizationKeysRequest } from "../../admin-console/models/request/organization-keys.request";
import { PlanType } from "../../billing/enums/plan-type";


export class OrganizationUpgradeRequest {
  businessName: string;
  planType: PlanType;
  additionalSeats: number;
  additionalStorageGb: number;
  premiumAccessAddon: boolean;
  billingAddressCountry: string;
  billingAddressPostalCode: string;
  keys: OrganizationKeysRequest;
}
