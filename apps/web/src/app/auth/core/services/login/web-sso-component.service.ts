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
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ToastService } from "@bitwarden/components";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/generator-legacy";

/**
 * This service is used to handle the SSO login process for the web client.
 */
@Injectable()
export class WebSsoComponentService
  extends DefaultSsoComponentService
  implements SsoComponentService
{
  clientId: SsoClientType;

  constructor(
    i18nService: I18nService,
    apiService: ApiService,
    environmentService: EnvironmentService,
    passwordGenerationService: PasswordGenerationServiceAbstraction,
    platformUtilsService: PlatformUtilsService,
    cryptoFunctionService: CryptoFunctionService,
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
    this.clientId = ClientType.Web;
  }

  setDocumentCookies(): void {
    document.cookie = `ssoHandOffMessage=${this.i18nService.t("ssoHandOff")};SameSite=strict`;
  }
}
