import { firstValueFrom } from "rxjs";
import { Jsonify } from "type-fest";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { KeyConnectorService } from "@bitwarden/common/auth/abstractions/key-connector.service";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { TwoFactorService } from "@bitwarden/common/auth/abstractions/two-factor.service";
import { UserApiTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/user-api-token.request";
import { IdentityTokenResponse } from "@bitwarden/common/auth/models/response/identity-token.response";
import { AppIdService } from "@bitwarden/common/platform/abstractions/app-id.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

import { UserApiLoginCredentials } from "../models/domain/login-credentials";
import { LoginStrategyCache } from "../services/login-strategies/login-strategy.state";

import { LoginStrategy, LoginStrategyData } from "./login.strategy";

export class UserApiLoginStrategyData implements LoginStrategyData {
  tokenRequest: UserApiTokenRequest;
  captchaBypassToken: string;

  static fromJSON(obj: Jsonify<UserApiLoginStrategyData>): UserApiLoginStrategyData {
    return Object.assign(new UserApiLoginStrategyData(), obj, {
      tokenRequest: UserApiTokenRequest.fromJSON(obj.tokenRequest),
    });
  }
}

export class UserApiLoginStrategy extends LoginStrategy {
  constructor(
    protected cache: LoginStrategyCache<UserApiLoginStrategyData>,
    cryptoService: CryptoService,
    apiService: ApiService,
    tokenService: TokenService,
    appIdService: AppIdService,
    platformUtilsService: PlatformUtilsService,
    messagingService: MessagingService,
    logService: LogService,
    stateService: StateService,
    twoFactorService: TwoFactorService,
    private environmentService: EnvironmentService,
    private keyConnectorService: KeyConnectorService,
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
      twoFactorService,
    );
  }

  override async logIn(credentials: UserApiLoginCredentials) {
    const tokenRequest = new UserApiTokenRequest(
      credentials.clientId,
      credentials.clientSecret,
      await this.buildTwoFactor(),
      await this.buildDeviceRequest(),
    );
    await this.cache.update((_) => Object.assign(new UserApiLoginStrategyData(), { tokenRequest }));

    const [authResult] = await this.startLogIn();
    return authResult;
  }

  protected override async setMasterKey(response: IdentityTokenResponse) {
    if (response.apiUseKeyConnector) {
      const keyConnectorUrl = this.environmentService.getKeyConnectorUrl();
      await this.keyConnectorService.setMasterKeyFromUrl(keyConnectorUrl);
    }
  }

  protected override async setUserKey(response: IdentityTokenResponse): Promise<void> {
    await this.cryptoService.setMasterKeyEncryptedUserKey(response.key);

    if (response.apiUseKeyConnector) {
      const masterKey = await this.cryptoService.getMasterKey();
      if (masterKey) {
        const userKey = await this.cryptoService.decryptUserKeyWithMasterKey(masterKey);
        await this.cryptoService.setUserKey(userKey);
      }
    }
  }

  protected override async setPrivateKey(response: IdentityTokenResponse): Promise<void> {
    await this.cryptoService.setPrivateKey(
      response.privateKey ?? (await this.createKeyPairForOldAccount()),
    );
  }

  protected async saveAccountInformation(tokenResponse: IdentityTokenResponse) {
    await super.saveAccountInformation(tokenResponse);

    const tokenRequest = (await firstValueFrom(this.cache.state$)).tokenRequest;
    await this.stateService.setApiKeyClientId(tokenRequest.clientId);
    await this.stateService.setApiKeyClientSecret(tokenRequest.clientSecret);
  }
}
