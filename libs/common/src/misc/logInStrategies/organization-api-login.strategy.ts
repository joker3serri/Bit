import { OrganizationIdentityTokenResponse } from "../../models/response/organization-identity-token.response";
import { ApiService } from "../../abstractions/api.service";
import { AppIdService } from "../../abstractions/appId.service";
import { CryptoService } from "../../abstractions/crypto.service";
import { EnvironmentService } from "../../abstractions/environment.service";
import { KeyConnectorService } from "../../abstractions/keyConnector.service";
import { LogService } from "../../abstractions/log.service";
import { MessagingService } from "../../abstractions/messaging.service";
import { PlatformUtilsService } from "../../abstractions/platformUtils.service";
import { StateService } from "../../abstractions/state.service";
import { TokenService } from "../../abstractions/token.service";
import { TwoFactorService } from "../../abstractions/twoFactor.service";
import { OrganizationApiLogInCredentials } from "../../models/domain/log-in-credentials";
import { OrganizationApiTokenRequest } from "../../models/request/identity-token/organization-api-token.request";

import { LogInStrategy } from "./logIn.strategy";

export class OrganizationApiLogInStrategy extends LogInStrategy {
  tokenRequest: OrganizationApiTokenRequest;

  constructor(
    cryptoService: CryptoService,
    apiService: ApiService,
    tokenService: TokenService,
    appIdService: AppIdService,
    platformUtilsService: PlatformUtilsService,
    messagingService: MessagingService,
    logService: LogService,
    stateService: StateService,
    twoFactorService: TwoFactorService
  ) {
    super(
      cryptoService,
      apiService,
      tokenService,
      appIdService,
      platformUtilsService,
      messagingService,
      logService,
      stateService,
      twoFactorService
    );
  }

  async onSuccessfulLogin(tokenResponse: OrganizationIdentityTokenResponse) {}

  async logIn(credentials: OrganizationApiLogInCredentials) {
    this.tokenRequest = new OrganizationApiTokenRequest(
      credentials.clientId,
      credentials.clientSecret
    );

    return this.startLogIn();
  }

  protected async setApiKeyInformation() {
    await this.stateService.setApiKeyClientId(this.tokenRequest.clientId);
    await this.stateService.setApiKeyClientSecret(this.tokenRequest.clientSecret);
  }
}
