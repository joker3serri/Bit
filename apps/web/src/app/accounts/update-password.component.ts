import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { UpdatePasswordComponent as BaseUpdatePasswordComponent } from "@bitwarden/angular/src/components/update-password.component";
import { ApiService } from "@bitwarden/common/src/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/src/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/src/abstractions/messaging.service";
import { PasswordGenerationService } from "@bitwarden/common/src/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/src/abstractions/policy.service";
import { StateService } from "@bitwarden/common/src/abstractions/state.service";
import { UserVerificationService } from "@bitwarden/common/src/abstractions/userVerification.service";

@Component({
  selector: "app-update-password",
  templateUrl: "update-password.component.html",
})
export class UpdatePasswordComponent extends BaseUpdatePasswordComponent {
  constructor(
    router: Router,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    passwordGenerationService: PasswordGenerationService,
    policyService: PolicyService,
    cryptoService: CryptoService,
    messagingService: MessagingService,
    apiService: ApiService,
    logService: LogService,
    stateService: StateService,
    userVerificationService: UserVerificationService
  ) {
    super(
      router,
      i18nService,
      platformUtilsService,
      passwordGenerationService,
      policyService,
      cryptoService,
      messagingService,
      apiService,
      stateService,
      userVerificationService,
      logService
    );
  }
}
