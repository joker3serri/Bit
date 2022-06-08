import { Component } from "@angular/core";

import { UpdateTempPasswordComponent as BaseUpdateTempPasswordComponent } from "@bitwarden/angular/src/components/update-temp-password.component";
import { ApiService } from "@bitwarden/common/src/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/src/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/src/abstractions/messaging.service";
import { PasswordGenerationService } from "@bitwarden/common/src/abstractions/passwordGeneration.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { PolicyService } from "@bitwarden/common/src/abstractions/policy.service";
import { StateService } from "@bitwarden/common/src/abstractions/state.service";
import { SyncService } from "@bitwarden/common/src/abstractions/sync.service";

@Component({
  selector: "app-update-temp-password",
  templateUrl: "update-temp-password.component.html",
})
export class UpdateTempPasswordComponent extends BaseUpdateTempPasswordComponent {
  constructor(
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    passwordGenerationService: PasswordGenerationService,
    policyService: PolicyService,
    cryptoService: CryptoService,
    messagingService: MessagingService,
    apiService: ApiService,
    logService: LogService,
    stateService: StateService,
    syncService: SyncService
  ) {
    super(
      i18nService,
      platformUtilsService,
      passwordGenerationService,
      policyService,
      cryptoService,
      messagingService,
      apiService,
      stateService,
      syncService,
      logService
    );
  }
}
