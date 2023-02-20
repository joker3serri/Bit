import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";

import { SecretWithProjectsListResponse } from "../../secrets/responses/secret-with-projects-list.response";

@Injectable({
  providedIn: "root",
})
export class TrashApiService {
  constructor(private apiService: ApiService) {}

  async getSecrets(organizationId: string): Promise<SecretWithProjectsListResponse> {
    const r = await this.apiService.send(
      "GET",
      "/secrets/" + organizationId + "/trash",
      null,
      true,
      true
    );

    return new SecretWithProjectsListResponse(r);
  }

  async deleteSecrets(organizationId: string, secretIds: string[]): Promise<void> {
    await this.apiService.send(
      "POST",
      "/secrets/" + organizationId + "/trash/empty",
      secretIds,
      true,
      true
    );
  }

  async restoreSecrets(organizationId: string, secretIds: string[]): Promise<void> {
    await this.apiService.send(
      "POST",
      "/secrets/" + organizationId + "/trash/restore",
      secretIds,
      true,
      true
    );
  }
}
