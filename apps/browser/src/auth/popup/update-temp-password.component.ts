import { Component } from "@angular/core";

import { UpdateTempPasswordComponent as BaseUpdateTempPasswordComponent } from "@bitwarden/angular/auth/components/update-temp-password.component";
import { DialogServiceAbstraction } from "@bitwarden/angular/services/dialog";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/common/tools/generator/password";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

@Component({
  selector: "app-update-temp-password",
  templateUrl: "update-temp-password.component.html",
})
export class UpdateTempPasswordComponent extends BaseUpdateTempPasswordComponent {
  constructor(
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    passwordGenerationService: PasswordGenerationServiceAbstraction,
    policyService: PolicyService,
    cryptoService: CryptoService,
    stateService: StateService,
    messagingService: MessagingService,
    apiService: ApiService,
    syncService: SyncService,
    logService: LogService,
    dialogService: DialogServiceAbstraction
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
      logService,
      dialogService
    );
  }
}
