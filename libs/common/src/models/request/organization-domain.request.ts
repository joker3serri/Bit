import { OrganizationDomainResponse } from "../response/organization-domain.response";

export class OrganizationDomainRequest {
  txt: string;
  domainName: string;

  constructor(orgDomainResponse: OrganizationDomainResponse) {
    this.txt = orgDomainResponse.txt;
    this.domainName = orgDomainResponse.domainName;
  }
}
