import { OrgDomainApiServiceAbstraction } from "../../abstractions/organization-domain/org-domain-api.service.abstraction";
import { OrganizationDomainRequest } from "../../models/request/organization-domain.request";
import { OrganizationDomainResponse } from "../../models/response/organization-domain.response";
import { ApiService } from "../api.service";

import { OrgDomainService } from "./org-domain.service";

export class OrgDomainApiService implements OrgDomainApiServiceAbstraction {
  constructor(private orgDomainService: OrgDomainService, private apiService: ApiService) {}

  async getByOrgId(orgId: string): Promise<OrganizationDomainResponse> {
    const result = await this.apiService.send(
      "GET",
      `/organizations/${orgId}/domain`,
      null,
      true,
      true
    );
    return new OrganizationDomainResponse(result);
  }
  async getByOrgIdAndOrgDomainId(
    orgId: string,
    orgDomainId: string
  ): Promise<OrganizationDomainResponse> {
    const result = await this.apiService.send(
      "GET",
      `/organizations/${orgId}/domain/${orgDomainId}`,
      null,
      true,
      true
    );
    return new OrganizationDomainResponse(result);
  }

  async post(orgId: string, orgDomain: OrganizationDomainResponse): Promise<any> {
    const request = new OrganizationDomainRequest(orgDomain);

    const result = await this.apiService.send(
      "POST",
      `/organizations/${orgId}`,
      request,
      true,
      true
    );

    const response = new OrganizationDomainResponse(result);

    await this.orgDomainService.upsert([response]);

    return response;
  }

  async verify(orgId: string, orgDomainId: string): Promise<boolean> {
    const result: boolean = await this.apiService.send(
      "POST",
      `/organizations/${orgId}/${orgDomainId}/verify`,
      null,
      true,
      true
    );

    return result;
  }

  async delete(orgId: string, orgDomainId: string): Promise<any> {
    this.apiService.send("DELETE", `/organizations/${orgId}/${orgDomainId}`, null, true, false);
    await this.orgDomainService.delete([orgDomainId]);
  }
}
