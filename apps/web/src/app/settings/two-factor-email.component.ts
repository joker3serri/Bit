import { Component } from "@angular/core";

import { ApiService } from "@bitwarden/common/src/abstractions/api.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/src/abstractions/state.service";
import { UserVerificationService } from "@bitwarden/common/src/abstractions/userVerification.service";
import { TwoFactorProviderType } from "@bitwarden/common/src/enums/twoFactorProviderType";
import { TwoFactorEmailRequest } from "@bitwarden/common/src/models/request/twoFactorEmailRequest";
import { UpdateTwoFactorEmailRequest } from "@bitwarden/common/src/models/request/updateTwoFactorEmailRequest";
import { TwoFactorEmailResponse } from "@bitwarden/common/src/models/response/twoFactorEmailResponse";

import { TwoFactorBaseComponent } from "./two-factor-base.component";

@Component({
  selector: "app-two-factor-email",
  templateUrl: "two-factor-email.component.html",
})
export class TwoFactorEmailComponent extends TwoFactorBaseComponent {
  type = TwoFactorProviderType.Email;
  email: string;
  token: string;
  sentEmail: string;
  formPromise: Promise<any>;
  emailPromise: Promise<any>;

  constructor(
    apiService: ApiService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    logService: LogService,
    userVerificationService: UserVerificationService,
    private stateService: StateService
  ) {
    super(apiService, i18nService, platformUtilsService, logService, userVerificationService);
  }

  auth(authResponse: any) {
    super.auth(authResponse);
    return this.processResponse(authResponse.response);
  }

  submit() {
    if (this.enabled) {
      return super.disable(this.formPromise);
    } else {
      return this.enable();
    }
  }

  async sendEmail() {
    try {
      const request = await this.buildRequestModel(TwoFactorEmailRequest);
      request.email = this.email;
      this.emailPromise = this.apiService.postTwoFactorEmailSetup(request);
      await this.emailPromise;
      this.sentEmail = this.email;
    } catch (e) {
      this.logService.error(e);
    }
  }

  protected async enable() {
    const request = await this.buildRequestModel(UpdateTwoFactorEmailRequest);
    request.email = this.email;
    request.token = this.token;

    return super.enable(async () => {
      this.formPromise = this.apiService.putTwoFactorEmail(request);
      const response = await this.formPromise;
      await this.processResponse(response);
    });
  }

  private async processResponse(response: TwoFactorEmailResponse) {
    this.token = null;
    this.email = response.email;
    this.enabled = response.enabled;
    if (!this.enabled && (this.email == null || this.email === "")) {
      this.email = await this.stateService.getEmail();
    }
  }
}
