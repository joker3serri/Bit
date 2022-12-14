import { OrganizationDomainRequest } from "../../services/organization-domain/requests/organization-domain.request";

import { OrganizationDomainResponse } from "./responses/organization-domain.response";

// TODO: add service tests ala https://github.com/bitwarden/clients/blob/master/libs/common/spec/web/services/webCryptoFunction.service.spec.ts
export abstract class OrgDomainApiServiceAbstraction {
  getAllByOrgId: (orgId: string) => Promise<Array<OrganizationDomainResponse>>;
  getByOrgIdAndOrgDomainId: (
    orgId: string,
    orgDomainId: string
  ) => Promise<OrganizationDomainResponse>;
  post: (
    orgId: string,
    orgDomain: OrganizationDomainRequest
  ) => Promise<OrganizationDomainResponse>;
  verify: (orgId: string, orgDomainId: string) => Promise<OrganizationDomainResponse>;
  delete: (orgId: string, orgDomainId: string) => Promise<any>;
}
