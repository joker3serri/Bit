import { Injectable } from "@angular/core";

import { DefaultLoginApprovalService, LoginApprovalComponent } from "@bitwarden/auth/angular";
import { LoginApprovalServiceAbstraction } from "@bitwarden/auth/common";
import { I18nService as I18nServiceAbstraction } from "@bitwarden/common/platform/abstractions/i18n.service";

@Injectable()
export class DesktopLoginApprovalService
  extends DefaultLoginApprovalService
  implements LoginApprovalServiceAbstraction
{
  constructor(private i18nService: I18nServiceAbstraction) {
    super();
  }

  async onInit(loginApprovalComponent: LoginApprovalComponent): Promise<void> {
    await ipc.auth.loginRequest(
      this.i18nService.t("logInRequested"),
      this.i18nService.t("confirmLoginAtemptForMail", loginApprovalComponent.email),
      this.i18nService.t("close"),
    );
  }
}
