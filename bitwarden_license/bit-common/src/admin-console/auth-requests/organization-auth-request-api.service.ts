import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { ListResponse } from "@bitwarden/common/models/response/list.response";
import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";

import { AdminAuthRequestUpdateRequest } from "./admin-auth-request-update.request";
import { BulkApproveAuthRequestsRequest } from "./bulk-approve-auth-requests.request";
import { BulkDenyAuthRequestsRequest } from "./bulk-deny-auth-requests.request";
import { PendingAuthRequestView } from "./pending-auth-request.view";
import { PendingOrganizationAuthRequestResponse } from "./pending-organization-auth-request.response";

export class OrganizationAuthRequestApiService {
  constructor(private apiService: ApiService) {}

  async listPendingRequests(organizationId: string): Promise<PendingAuthRequestView[]> {
    const r = await this.apiService.send(
      "GET",
      `/organizations/${organizationId}/auth-requests`,
      null,
      true,
      true,
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
      false,
    );
  }

  async approvePendingRequests(organizationId: string, ...requestIds: string[]): Promise<void> {
    await this.apiService.send(
      "POST",
      `/organizations/${organizationId}/auth-requests/approve`,
      new BulkApproveAuthRequestsRequest(requestIds),
      true,
      false,
    );
  }

  async approvePendingRequest(
    organizationId: string,
    requestId: string,
    encryptedKey: EncString,
  ): Promise<void> {
    await this.apiService.send(
      "POST",
      `/organizations/${organizationId}/auth-requests/${requestId}`,
      new AdminAuthRequestUpdateRequest(true, encryptedKey.encryptedString),
      true,
      false,
    );
  }
}
