import { OrganizationDomainResponse } from "./responses/organization-domain.response";

export class OrgDomainApiServiceAbstraction {
  getAllByOrgId: (orgId: string) => Promise<Array<OrganizationDomainResponse>>;
  getByOrgIdAndOrgDomainId: (
    orgId: string,
    orgDomainId: string
  ) => Promise<OrganizationDomainResponse>;
  post: (orgId: string, orgDomain: OrganizationDomainResponse) => Promise<any>;
  verify: (orgId: string, orgDomainId: string) => Promise<boolean>;
  delete: (orgId: string, orgDomainId: string) => Promise<any>;
}
