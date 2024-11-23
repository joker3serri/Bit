import { Injectable, Inject } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { WINDOW } from "@bitwarden/angular/services/injection-tokens";
import {
  DefaultSsoComponentService,
  SsoClientType,
  SsoComponentService,
} from "@bitwarden/auth/angular";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { SsoLoginServiceAbstraction } from "@bitwarden/common/auth/abstractions/sso-login.service.abstraction";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { ClientType } from "@bitwarden/common/enums";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { ToastService } from "@bitwarden/components";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/generator-legacy";

import { BrowserApi } from "../../../platform/browser/browser-api";

/**
 * This service is used to handle the SSO login process for the browser extension.
 */
@Injectable()
export class ExtensionSsoComponentService
  extends DefaultSsoComponentService
  implements SsoComponentService
{
  clientId: SsoClientType;
  redirectUri: string;
  onSuccessfulLogin: () => Promise<void>;
  onSuccessfulLoginTde: () => Promise<void>;
  onSuccessfulLoginTdeNavigate: () => Promise<void>;

  constructor(
    private syncService: SyncService,
    private authService: AuthService,
    private logService: LogService,
    apiService: ApiService,
    environmentService: EnvironmentService,
    passwordGenerationService: PasswordGenerationServiceAbstraction,
    cryptoFunctionService: CryptoFunctionService,
    platformUtilsService: PlatformUtilsService,
    i18nService: I18nService,
    toastService: ToastService,
    ssoLoginService: SsoLoginServiceAbstraction,
    @Inject(WINDOW) private win: Window,
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
    this.clientId = ClientType.Browser;

    environmentService.environment$.pipe(takeUntilDestroyed()).subscribe((env) => {
      this.redirectUri = env.getWebVaultUrl() + "/sso-connector.html";
    });

    this.onSuccessfulLogin = async () => {
      try {
        await this.syncService.fullSync(true, true);
      } catch (error) {
        this.logService.error("Error syncing after SSO login:", error);
      }

      // If the vault is unlocked then this will clear keys from memory, which we don't want to do
      if ((await this.authService.getAuthStatus()) !== AuthenticationStatus.Unlocked) {
        BrowserApi.reloadOpenWindows();
      }

      this.win.close();
    };

    this.onSuccessfulLoginTde = async () => {
      try {
        await this.syncService.fullSync(true, true);
      } catch (error) {
        this.logService.error("Error syncing after TDE SSO login:", error);
      }
    };

    this.onSuccessfulLoginTdeNavigate = async () => {
      this.win.close();
    };
  }
}
