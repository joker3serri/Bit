import { Component, NgZone } from "@angular/core";
import { Router } from "@angular/router";

import { LockComponent as BaseLockComponent } from "@bitwarden/angular/src/components/lock.component";
import { ApiService } from "@bitwarden/common/src/abstractions/api.service";
import { CryptoService } from "@bitwarden/common/src/abstractions/crypto.service";
import { EnvironmentService } from "@bitwarden/common/src/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { KeyConnectorService } from "@bitwarden/common/src/abstractions/keyConnector.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/src/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/src/abstractions/state.service";
import { VaultTimeoutService } from "@bitwarden/common/src/abstractions/vaultTimeout.service";

import { RouterService } from "../services/router.service";

@Component({
  selector: "app-lock",
  templateUrl: "lock.component.html",
})
export class LockComponent extends BaseLockComponent {
  constructor(
    router: Router,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    messagingService: MessagingService,
    cryptoService: CryptoService,
    vaultTimeoutService: VaultTimeoutService,
    environmentService: EnvironmentService,
    private routerService: RouterService,
    stateService: StateService,
    apiService: ApiService,
    logService: LogService,
    keyConnectorService: KeyConnectorService,
    ngZone: NgZone
  ) {
    super(
      router,
      i18nService,
      platformUtilsService,
      messagingService,
      cryptoService,
      vaultTimeoutService,
      environmentService,
      stateService,
      apiService,
      logService,
      keyConnectorService,
      ngZone
    );
  }

  async ngOnInit() {
    await super.ngOnInit();
    this.onSuccessfulSubmit = async () => {
      const previousUrl = this.routerService.getPreviousUrl();
      if (previousUrl && previousUrl !== "/" && previousUrl.indexOf("lock") === -1) {
        this.successRoute = previousUrl;
      }
      this.router.navigateByUrl(this.successRoute);
    };
  }
}
