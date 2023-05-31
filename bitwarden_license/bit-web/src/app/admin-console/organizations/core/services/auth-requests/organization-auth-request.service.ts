import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { ListResponse } from "@bitwarden/common/models/response/list.response";

import { CoreOrganizationModule } from "../../core-organization.module";
import { PendingAuthRequestView } from "../../views/pending-auth-request.view";

import { PendingOrganizationAuthRequestResponse } from "./pending-organization-auth-request.response";

@Injectable({ providedIn: CoreOrganizationModule })
export class OrganizationAuthRequestService {
  constructor(private apiService: ApiService) {}

  async listPendingRequests(organizationId: string): Promise<PendingAuthRequestView[]> {
    const r = await this.apiService.send(
      "GET",
      `organizations/${organizationId}/auth-requests/pending`,
      null,
      true,
      true
    );

    const listResponse = new ListResponse(r, PendingOrganizationAuthRequestResponse);

    return listResponse.data.map((ar) => PendingAuthRequestView.fromResponse(ar));
  }
}
