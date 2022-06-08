import { Component } from "@angular/core";

import { ApiService } from "@bitwarden/common/src/abstractions/api.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/src/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { UserVerificationService } from "@bitwarden/common/src/abstractions/userVerification.service";
import { Verification } from "@bitwarden/common/src/types/verification";

@Component({
  selector: "app-delete-account",
  templateUrl: "delete-account.component.html",
})
export class DeleteAccountComponent {
  masterPassword: Verification;
  formPromise: Promise<any>;

  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private userVerificationService: UserVerificationService,
    private messagingService: MessagingService,
    private logService: LogService
  ) {}

  async submit() {
    try {
      this.formPromise = this.userVerificationService
        .buildRequest(this.masterPassword)
        .then((request) => this.apiService.deleteAccount(request));
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        this.i18nService.t("accountDeleted"),
        this.i18nService.t("accountDeletedDesc")
      );
      this.messagingService.send("logout");
    } catch (e) {
      this.logService.error(e);
    }
  }
}
