import { OrganizationKeysRequest } from "./organizationKeysRequest";

export class OrganizationUpdateRequest {
  name: string;
  /**
   * @deprecated 2022-08-03 Moved to OrganizationSsoRequest, left for backwards compatability
   */
  identifier: string;
  businessName: string;
  billingEmail: string;
  keys: OrganizationKeysRequest;
}
