import { OrganizationResponse } from "../../admin-console/models/response/organization.response";
import {
  PurchaseOrganizationRequest,
  StartFreeOrganizationRequest,
} from "../models/domain/subscription-information";

export abstract class OrganizationBillingServiceAbstraction {
  purchaseOrganization: (request: PurchaseOrganizationRequest) => Promise<OrganizationResponse>;
  startFreeOrganization: (request: StartFreeOrganizationRequest) => Promise<OrganizationResponse>;
}
