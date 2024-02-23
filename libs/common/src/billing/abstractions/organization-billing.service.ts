import { OrganizationResponse } from "../../admin-console/models/response/organization.response";
import {
  FreeOrganizationSignup,
  PaidOrganizationSignup,
} from "../models/domain/organization-signup";

export abstract class OrganizationBillingServiceAbstraction {
  purchase: (signup: PaidOrganizationSignup) => Promise<OrganizationResponse>;
  startFree: (signup: FreeOrganizationSignup) => Promise<OrganizationResponse>;
}
