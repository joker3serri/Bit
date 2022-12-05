import { OrgDomainApiServiceAbstraction } from "../../abstractions/organization-domain/org-domain-api.service.abstraction";
import { OrganizationDomainResponse } from "../../abstractions/organization-domain/responses/organization-domain.response";
import { ListResponse } from "../../models/response/list.response";
import { ApiService } from "../api.service";

import { OrgDomainService } from "./org-domain.service";
import { OrganizationDomainRequest } from "./requests/organization-domain.request";

export class OrgDomainApiService implements OrgDomainApiServiceAbstraction {
  constructor(private orgDomainService: OrgDomainService, private apiService: ApiService) {}

  async getAllByOrgId(orgId: string): Promise<Array<OrganizationDomainResponse>> {
    const listResponse: ListResponse<any> = await this.apiService.send(
      "GET",
      `/organizations/${orgId}/domain`,
      null,
      true,
      true
    );

    const orgDomains = listResponse.data.map(
      (resultOrgDomain: any) => new OrganizationDomainResponse(resultOrgDomain)
    );

    this.orgDomainService.replace(orgDomains);

    return orgDomains;
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

    const response = new OrganizationDomainResponse(result);

    this.orgDomainService.upsert([response]);

    return response;
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

    this.orgDomainService.upsert([response]);

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
    this.orgDomainService.delete([orgDomainId]);
  }

  // TODO: add Get Domain SSO method: Retrieves SSO provider information given a domain name
  // when added on back end
}
