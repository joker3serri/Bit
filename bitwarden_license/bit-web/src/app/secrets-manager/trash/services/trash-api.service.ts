import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { SecretWithProjectsListResponse } from "../../secrets/responses/secret-with-projects-list.response";

@Injectable({
  providedIn: "root",
})
export class TrashApiService {
  constructor(private apiService: ApiService, private i18nService: I18nService) {}

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
}
