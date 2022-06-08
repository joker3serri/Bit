import { Component } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";

import { SetPasswordComponent as BaseSetPasswordComponent } from "@bitwarden/angular/src/components/set-password.component";
import { ApiService } from "@bitwarden/common/src/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/src/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/src/abstractions/messaging.service";
import { PasswordGenerationService } from "@bitwarden/common/src/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/src/abstractions/policy.service";
import { StateService } from "@bitwarden/common/src/abstractions/state.service";
import { SyncService } from "@bitwarden/common/src/abstractions/sync.service";

@Component({
  selector: "app-set-password",
  templateUrl: "set-password.component.html",
})
export class SetPasswordComponent extends BaseSetPasswordComponent {
  constructor(
    apiService: ApiService,
    i18nService: I18nService,
    cryptoService: CryptoService,
    messagingService: MessagingService,
    passwordGenerationService: PasswordGenerationService,
    platformUtilsService: PlatformUtilsService,
    policyService: PolicyService,
    router: Router,
    syncService: SyncService,
    route: ActivatedRoute,
    stateService: StateService
  ) {
    super(
      i18nService,
      cryptoService,
      messagingService,
      passwordGenerationService,
      platformUtilsService,
      policyService,
      router,
      apiService,
      syncService,
      route,
      stateService
    );
  }
}
