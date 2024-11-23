import { Injectable } from "@angular/core";

import {
  DefaultSsoComponentService,
  SsoClientType,
  SsoComponentService,
} from "@bitwarden/auth/angular";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { SsoLoginServiceAbstraction } from "@bitwarden/common/auth/abstractions/sso-login.service.abstraction";
import { ClientType } from "@bitwarden/common/enums";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { ToastService } from "@bitwarden/components";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/generator-legacy";

/**
 * This service is used to handle the SSO login process for the desktop client.
 */
@Injectable()
export class DesktopSsoComponentService
  extends DefaultSsoComponentService
  implements SsoComponentService
{
  clientId: SsoClientType;
  redirectUri: string;
  onSuccessfulLogin: () => Promise<void>;
  onSuccessfulLoginTde: () => Promise<void>;

  constructor(
    private syncService: SyncService,
    private logService: LogService,
    apiService: ApiService,
    environmentService: EnvironmentService,
    passwordGenerationService: PasswordGenerationServiceAbstraction,
    cryptoFunctionService: CryptoFunctionService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    toastService: ToastService,
    ssoLoginService: SsoLoginServiceAbstraction,
  ) {
    super(
      apiService,
      environmentService,
      passwordGenerationService,
      cryptoFunctionService,
      platformUtilsService,
      i18nService,
      toastService,
      ssoLoginService,
    );
    this.clientId = ClientType.Desktop;
    this.redirectUri = "bitwarden://sso-callback";

    this.onSuccessfulLogin = async () => {
      try {
        await this.syncService.fullSync(true, true);
      } catch (error) {
        this.logService.error("Error syncing after SSO login:", error);
      }
    };

    this.onSuccessfulLoginTde = async () => {
      try {
        await this.syncService.fullSync(true, true);
      } catch (error) {
        this.logService.error("Error syncing after TDE SSO login:", error);
      }
    };
  }
}
