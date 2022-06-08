import { Directive, EventEmitter, Output } from "@angular/core";

import { ApiService } from "@bitwarden/common/src/abstractions/api.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { UserVerificationService } from "@bitwarden/common/src/abstractions/userVerification.service";
import { TwoFactorProviderType } from "@bitwarden/common/src/enums/twoFactorProviderType";
import { VerificationType } from "@bitwarden/common/src/enums/verificationType";
import { SecretVerificationRequest } from "@bitwarden/common/src/models/request/secretVerificationRequest";
import { TwoFactorProviderRequest } from "@bitwarden/common/src/models/request/twoFactorProviderRequest";

@Directive()
export abstract class TwoFactorBaseComponent {
  @Output() onUpdated = new EventEmitter<boolean>();

  type: TwoFactorProviderType;
  organizationId: string;
  twoFactorProviderType = TwoFactorProviderType;
  enabled = false;
  authed = false;

  protected hashedSecret: string;
  protected verificationType: VerificationType;

  constructor(
    protected apiService: ApiService,
    protected i18nService: I18nService,
    protected platformUtilsService: PlatformUtilsService,
    protected logService: LogService,
    protected userVerificationService: UserVerificationService
  ) {}

  protected auth(authResponse: any) {
    this.hashedSecret = authResponse.secret;
    this.verificationType = authResponse.verificationType;
    this.authed = true;
  }

  protected async enable(enableFunction: () => Promise<void>) {
    try {
      await enableFunction();
      this.onUpdated.emit(true);
    } catch (e) {
      this.logService.error(e);
    }
  }

  protected async disable(promise: Promise<any>) {
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("twoStepDisableDesc"),
      this.i18nService.t("disable"),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return;
    }

    try {
      const request = await this.buildRequestModel(TwoFactorProviderRequest);
      request.type = this.type;
      if (this.organizationId != null) {
        promise = this.apiService.putTwoFactorOrganizationDisable(this.organizationId, request);
      } else {
        promise = this.apiService.putTwoFactorDisable(request);
      }
      await promise;
      this.enabled = false;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("twoStepDisabled"));
      this.onUpdated.emit(false);
    } catch (e) {
      this.logService.error(e);
    }
  }

  protected async buildRequestModel<T extends SecretVerificationRequest>(
    requestClass: new () => T
  ) {
    return this.userVerificationService.buildRequest(
      {
        secret: this.hashedSecret,
        type: this.verificationType,
      },
      requestClass,
      true
    );
  }
}
