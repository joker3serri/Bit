import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { SsoLoginServiceAbstraction } from "@bitwarden/common/auth/abstractions/sso-login.service.abstraction";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { ToastService } from "@bitwarden/components";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/generator-legacy";

import { SsoComponentService, SsoClientType } from "./sso-component.service";

@Injectable()
export class DefaultSsoComponentService implements SsoComponentService {
  clientId: SsoClientType;

  constructor(
    private apiService: ApiService,
    private environmentService: EnvironmentService,
    private passwordGenerationService: PasswordGenerationServiceAbstraction,
    private cryptoFunctionService: CryptoFunctionService,
    private platformUtilsService: PlatformUtilsService,
    protected i18nService: I18nService,
    private toastService: ToastService,
    private ssoLoginService: SsoLoginServiceAbstraction,
  ) {}

  /**
   * Default no-op implementation as extension and desktop don't need to set cookies.
   */
  setDocumentCookies(): void {}

  async submitSso(
    identifier: string,
    returnUri?: string,
    includeUserIdentifier?: boolean,
  ): Promise<void> {
    if (!identifier) {
      this.toastService.showToast({
        variant: "error",
        title: this.i18nService.t("ssoValidationFailed"),
        message: this.i18nService.t("ssoIdentifierRequired"),
      });
      return;
    }

    const response = await this.apiService.preValidateSso(identifier);

    const authorizeUrl = await this.buildAuthorizeUrl(
      identifier,
      returnUri,
      includeUserIdentifier,
      response.token,
    );
    this.platformUtilsService.launchUri(authorizeUrl, { sameWindow: true });
  }

  async buildAuthorizeUrl(
    identifier: string,
    returnUri?: string,
    includeUserIdentifier?: boolean,
    token?: string,
    redirectUri?: string,
    state?: string,
    codeChallenge?: string,
  ): Promise<string> {
    const passwordOptions = {
      type: "password" as const,
      length: 64,
      uppercase: true,
      lowercase: true,
      numbers: true,
      special: false,
    };

    if (codeChallenge == null) {
      const codeVerifier = await this.passwordGenerationService.generatePassword(passwordOptions);
      const codeVerifierHash = await this.cryptoFunctionService.hash(codeVerifier, "sha256");
      codeChallenge = Utils.fromBufferToUrlB64(codeVerifierHash);
      await this.ssoLoginService.setCodeVerifier(codeVerifier);
    }

    if (state == null) {
      state = await this.passwordGenerationService.generatePassword(passwordOptions);
      if (returnUri) {
        state += `_returnUri='${returnUri}'`;
      }
    }

    state += `_identifier=${identifier}`;
    await this.ssoLoginService.setSsoState(state);

    const env = await firstValueFrom(this.environmentService.environment$);
    redirectUri = redirectUri || window.location.origin + "/sso-connector.html";

    let authorizeUrl =
      env.getIdentityUrl() +
      "/connect/authorize?" +
      "client_id=" +
      this.clientId +
      "&redirect_uri=" +
      encodeURIComponent(redirectUri) +
      "&" +
      "response_type=code&scope=api offline_access&" +
      "state=" +
      state +
      "&code_challenge=" +
      codeChallenge +
      "&" +
      "code_challenge_method=S256&response_mode=query&" +
      "domain_hint=" +
      encodeURIComponent(identifier) +
      "&ssoToken=" +
      encodeURIComponent(token);

    if (includeUserIdentifier) {
      const userIdentifier = await this.apiService.getSsoUserIdentifier();
      authorizeUrl += `&user_identifier=${encodeURIComponent(userIdentifier)}`;
    }

    return authorizeUrl;
  }
}
