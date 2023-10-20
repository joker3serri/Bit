import { Injectable, NgZone } from "@angular/core";
import { OidcClient, Log as OidcLog } from "oidc-client-ts";
import { Subject } from "rxjs";

import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { DeviceType } from "@bitwarden/common/enums";
import { BroadcasterService } from "@bitwarden/common/platform/abstractions/broadcaster.service";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/common/tools/generator/password";

import { ClientInfo, Vault } from "../../importers/lastpass/access";
import { FederatedUserContext } from "../../importers/lastpass/access/models";

import { LastPassDirectImportUIService } from "./lastpass-direct-import-ui.service";

@Injectable({
  providedIn: "root",
})
export class LastPassDirectImportService {
  private vault: Vault;

  private oidcClient: OidcClient;

  private _ssoCallback$ = new Subject<{ oidcCode: string; oidcState: string }>();
  ssoCallback$ = this._ssoCallback$.asObservable();

  constructor(
    private tokenService: TokenService,
    private cryptoFunctionService: CryptoFunctionService,
    private lastPassDirectImportUIService: LastPassDirectImportUIService,
    private platformUtilsService: PlatformUtilsService,
    private passwordGenerationService: PasswordGenerationServiceAbstraction,
    private broadcasterService: BroadcasterService,
    private ngZone: NgZone
  ) {
    this.vault = new Vault(this.cryptoFunctionService, this.tokenService);

    OidcLog.setLogger(console);
    OidcLog.setLevel(OidcLog.DEBUG);

    /** TODO: remove this in favor of dedicated service */
    this.broadcasterService.subscribe("LastPassDirectImportService", (message: any) => {
      this.ngZone.run(async () => {
        switch (message.command) {
          case "ssoCallbackLastPass":
            this._ssoCallback$.next({ oidcCode: message.code, oidcState: message.state });
            break;
          default:
            break;
        }
      });
    });
  }

  async verifyLastPassAccountExists(email: string) {
    await this.vault.setUserTypeContext(email);
  }

  get isAccountFederated(): boolean {
    return this.vault.userType.isFederated();
  }

  async handleStandardImport(
    email: string,
    password: string,
    includeSharedFolders: boolean
  ): Promise<string> {
    await this.vault.open(
      email,
      password,
      ClientInfo.createClientInfo(),
      this.lastPassDirectImportUIService
    );

    return this.vault.accountsToExportedCsvString(!includeSharedFolders);
  }

  async createOidcSigninRequest() {
    this.oidcClient = new OidcClient({
      authority: this.vault.userType.openIDConnectAuthorityBase,
      client_id: this.vault.userType.openIDConnectClientId,
      redirect_uri: this.getOidcRedirectUrl(),
      response_type: "code",
      scope: this.vault.userType.oidcScope,
      response_mode: "query",
      loadUserInfo: true,
    });

    return await this.oidcClient.createSigninRequest({
      nonce: await this.passwordGenerationService.generatePassword({
        length: 20,
        uppercase: true,
        lowercase: true,
        number: true,
      }),
    });
  }

  private getOidcRedirectUrlWithParams(oidcCode: string, oidcState: string) {
    const redirectUri = this.oidcClient.settings.redirect_uri;
    const params = "code=" + oidcCode + "&state=" + oidcState;
    if (redirectUri.indexOf("bitwarden://") === 0) {
      return redirectUri + "/?" + params;
    }

    return redirectUri + "&" + params;
  }

  private getOidcRedirectUrl() {
    const deviceType = this.platformUtilsService.getDevice();
    switch (deviceType) {
      case DeviceType.WindowsDesktop:
      case DeviceType.MacOsDesktop:
      case DeviceType.LinuxDesktop:
        return "bitwarden://sso-callback-lp";
      default:
        return window.location.origin + "/sso-connector.html?lp=1";
    }
  }

  async handleFederatedImport(
    oidcCode: string,
    oidcState: string,
    includeSharedFolders: boolean
  ): Promise<string> {
    const response = await this.oidcClient.processSigninResponse(
      this.getOidcRedirectUrlWithParams(oidcCode, oidcState)
    );
    const userState = response.userState as any;

    const federatedUser = new FederatedUserContext();
    federatedUser.idToken = response.id_token;
    federatedUser.accessToken = response.access_token;
    federatedUser.idpUserInfo = response.profile;
    federatedUser.username = userState.email;

    await this.vault.openFederated(
      federatedUser,
      ClientInfo.createClientInfo(),
      this.lastPassDirectImportUIService
    );

    return this.vault.accountsToExportedCsvString(!includeSharedFolders);
  }
}
