import { Component, EventEmitter, Input, Output } from "@angular/core";

import { ApiService } from "@bitwarden/common/src/abstractions/api.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { UserVerificationService } from "@bitwarden/common/src/abstractions/userVerification.service";
import { TwoFactorProviderType } from "@bitwarden/common/src/enums/twoFactorProviderType";
import { VerificationType } from "@bitwarden/common/src/enums/verificationType";
import { SecretVerificationRequest } from "@bitwarden/common/src/models/request/secretVerificationRequest";
import { TwoFactorAuthenticatorResponse } from "@bitwarden/common/src/models/response/twoFactorAuthenticatorResponse";
import { TwoFactorDuoResponse } from "@bitwarden/common/src/models/response/twoFactorDuoResponse";
import { TwoFactorEmailResponse } from "@bitwarden/common/src/models/response/twoFactorEmailResponse";
import { TwoFactorRecoverResponse } from "@bitwarden/common/src/models/response/twoFactorRescoverResponse";
import { TwoFactorWebAuthnResponse } from "@bitwarden/common/src/models/response/twoFactorWebAuthnResponse";
import { TwoFactorYubiKeyResponse } from "@bitwarden/common/src/models/response/twoFactorYubiKeyResponse";
import { Verification } from "@bitwarden/common/src/types/verification";

type TwoFactorResponse =
  | TwoFactorRecoverResponse
  | TwoFactorDuoResponse
  | TwoFactorEmailResponse
  | TwoFactorWebAuthnResponse
  | TwoFactorAuthenticatorResponse
  | TwoFactorYubiKeyResponse;

@Component({
  selector: "app-two-factor-verify",
  templateUrl: "two-factor-verify.component.html",
})
export class TwoFactorVerifyComponent {
  @Input() type: TwoFactorProviderType;
  @Input() organizationId: string;
  @Output() onAuthed = new EventEmitter<any>();

  secret: Verification;
  formPromise: Promise<TwoFactorResponse>;

  constructor(
    private apiService: ApiService,
    private logService: LogService,
    private userVerificationService: UserVerificationService
  ) {}

  async submit() {
    let hashedSecret: string;

    try {
      this.formPromise = this.userVerificationService.buildRequest(this.secret).then((request) => {
        hashedSecret =
          this.secret.type === VerificationType.MasterPassword
            ? request.masterPasswordHash
            : request.otp;
        return this.apiCall(request);
      });

      const response = await this.formPromise;
      this.onAuthed.emit({
        response: response,
        secret: hashedSecret,
        verificationType: this.secret.type,
      });
    } catch (e) {
      this.logService.error(e);
    }
  }

  private apiCall(request: SecretVerificationRequest): Promise<TwoFactorResponse> {
    switch (this.type) {
      case -1 as TwoFactorProviderType:
        return this.apiService.getTwoFactorRecover(request);
      case TwoFactorProviderType.Duo:
      case TwoFactorProviderType.OrganizationDuo:
        if (this.organizationId != null) {
          return this.apiService.getTwoFactorOrganizationDuo(this.organizationId, request);
        } else {
          return this.apiService.getTwoFactorDuo(request);
        }
      case TwoFactorProviderType.Email:
        return this.apiService.getTwoFactorEmail(request);
      case TwoFactorProviderType.WebAuthn:
        return this.apiService.getTwoFactorWebAuthn(request);
      case TwoFactorProviderType.Authenticator:
        return this.apiService.getTwoFactorAuthenticator(request);
      case TwoFactorProviderType.Yubikey:
        return this.apiService.getTwoFactorYubiKey(request);
    }
  }
}
