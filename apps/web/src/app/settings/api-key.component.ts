import { Component } from "@angular/core";

import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { UserVerificationService } from "@bitwarden/common/src/abstractions/userVerification.service";
import { SecretVerificationRequest } from "@bitwarden/common/src/models/request/secretVerificationRequest";
import { ApiKeyResponse } from "@bitwarden/common/src/models/response/apiKeyResponse";
import { Verification } from "@bitwarden/common/src/types/verification";

@Component({
  selector: "app-api-key",
  templateUrl: "api-key.component.html",
})
export class ApiKeyComponent {
  keyType: string;
  isRotation: boolean;
  postKey: (entityId: string, request: SecretVerificationRequest) => Promise<ApiKeyResponse>;
  entityId: string;
  scope: string;
  grantType: string;
  apiKeyTitle: string;
  apiKeyWarning: string;
  apiKeyDescription: string;

  masterPassword: Verification;
  formPromise: Promise<ApiKeyResponse>;
  clientId: string;
  clientSecret: string;

  constructor(
    private userVerificationService: UserVerificationService,
    private logService: LogService
  ) {}

  async submit() {
    try {
      this.formPromise = this.userVerificationService
        .buildRequest(this.masterPassword)
        .then((request) => this.postKey(this.entityId, request));
      const response = await this.formPromise;
      this.clientSecret = response.apiKey;
      this.clientId = `${this.keyType}.${this.entityId}`;
    } catch (e) {
      this.logService.error(e);
    }
  }
}
