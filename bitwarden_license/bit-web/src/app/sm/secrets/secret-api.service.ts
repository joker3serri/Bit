import { Injectable } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { ListResponse } from "@bitwarden/common/models/response/listResponse";

import { CreateSecretRequest } from "./requests/create-secret.request";
import { SecretIdentifierResponse } from "./responses/secret-identifier.response";
import { SecretResponse } from "./responses/secret.response";

@Injectable({
  providedIn: "any",
})
export class SecretApiService {
  constructor(private apiService: ApiService) {}

  async getSecretsByOrganizationId(
    organizationId: string
  ): Promise<ListResponse<SecretIdentifierResponse>> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/secrets",
      null,
      true,
      true
    );
    return new ListResponse(r, SecretIdentifierResponse);
  }

  async createSecret(
    organizationId: string,
    request: CreateSecretRequest
  ): Promise<SecretResponse> {
    const r = await this.apiService.send(
      "POST",
      "/organizations/" + organizationId + "/secrets",
      request,
      true,
      true
    );
    return new SecretResponse(r);
  }
}
