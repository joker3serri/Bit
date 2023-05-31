import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { ListResponse } from "@bitwarden/common/models/response/list.response";

import { CoreOrganizationModule } from "../../core-organization.module";
import { PendingAuthRequestView } from "../../views/pending-auth-request.view";

import { BulkDenyAuthRequestsRequest } from "./bulk-deny-auth-requests.request";
import { PendingOrganizationAuthRequestResponse } from "./pending-organization-auth-request.response";

@Injectable({ providedIn: CoreOrganizationModule })
export class OrganizationAuthRequestService {
  constructor(private apiService: ApiService) {}

  async listPendingRequests(organizationId: string): Promise<PendingAuthRequestView[]> {
    const r = await this.apiService.send(
      "GET",
      `/organizations/${organizationId}/auth-requests`,
      null,
      true,
      true
    );

    const listResponse = new ListResponse(r, PendingOrganizationAuthRequestResponse);

    return listResponse.data.map((ar) => PendingAuthRequestView.fromResponse(ar));
  }

  async denyPendingRequests(organizationId: string, ...requestIds: string[]): Promise<void> {
    await this.apiService.send(
      "POST",
      `/organizations/${organizationId}/auth-requests/deny`,
      new BulkDenyAuthRequestsRequest(requestIds),
      true,
      false
    );
  }
}
