import { MockProxy, mock } from "jest-mock-extended";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { AuthRequestCryptoServiceAbstraction } from "@bitwarden/common/auth/abstractions/auth-request-crypto.service.abstraction";
import { DeviceTrustCryptoServiceAbstraction } from "@bitwarden/common/auth/abstractions/device-trust-crypto.service.abstraction";
import { KeyConnectorService } from "@bitwarden/common/auth/abstractions/key-connector.service";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { TwoFactorService } from "@bitwarden/common/auth/abstractions/two-factor.service";
import { TwoFactorProviderType } from "@bitwarden/common/auth/enums/two-factor-provider-type";
import { TokenTwoFactorRequest } from "@bitwarden/common/auth/models/request/identity-token/token-two-factor.request";
import { IdentityTwoFactorResponse } from "@bitwarden/common/auth/models/response/identity-two-factor.response";
import { AppIdService } from "@bitwarden/common/platform/abstractions/app-id.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { FakeGlobalState, FakeGlobalStateProvider } from "@bitwarden/common/spec";
import { PasswordStrengthServiceAbstraction } from "@bitwarden/common/tools/password-strength";

import { PasswordLoginCredentials } from "../../models";

import { LoginStrategyService } from "./login-strategy.service";
import { CACHE_EXPIRATION_KEY } from "./login-strategy.state";

describe("LoginStrategyService", () => {
  let sut: LoginStrategyService;

  let cryptoService: MockProxy<CryptoService>;
  let apiService: MockProxy<ApiService>;
  let tokenService: MockProxy<TokenService>;
  let appIdService: MockProxy<AppIdService>;
  let platformUtilsService: MockProxy<PlatformUtilsService>;
  let messagingService: MockProxy<MessagingService>;
  let logService: MockProxy<LogService>;
  let keyConnectorService: MockProxy<KeyConnectorService>;
  let environmentService: MockProxy<EnvironmentService>;
  let stateService: MockProxy<StateService>;
  let twoFactorService: MockProxy<TwoFactorService>;
  let i18nService: MockProxy<I18nService>;
  let encryptService: MockProxy<EncryptService>;
  let passwordStrengthService: MockProxy<PasswordStrengthServiceAbstraction>;
  let policyService: MockProxy<PolicyService>;
  let deviceTrustCryptoService: MockProxy<DeviceTrustCryptoServiceAbstraction>;
  let authReqCryptoService: MockProxy<AuthRequestCryptoServiceAbstraction>;

  let stateProvider: FakeGlobalStateProvider;
  let loginStrategyCacheExpirationState: FakeGlobalState<Date | null>;

  beforeEach(() => {
    cryptoService = mock<CryptoService>();
    apiService = mock<ApiService>();
    tokenService = mock<TokenService>();
    appIdService = mock<AppIdService>();
    platformUtilsService = mock<PlatformUtilsService>();
    messagingService = mock<MessagingService>();
    logService = mock<LogService>();
    keyConnectorService = mock<KeyConnectorService>();
    environmentService = mock<EnvironmentService>();
    stateService = mock<StateService>();
    twoFactorService = mock<TwoFactorService>();
    i18nService = mock<I18nService>();
    encryptService = mock<EncryptService>();
    passwordStrengthService = mock<PasswordStrengthServiceAbstraction>();
    policyService = mock<PolicyService>();
    deviceTrustCryptoService = mock<DeviceTrustCryptoServiceAbstraction>();
    authReqCryptoService = mock<AuthRequestCryptoServiceAbstraction>();
    stateProvider = new FakeGlobalStateProvider();

    sut = new LoginStrategyService(
      cryptoService,
      apiService,
      tokenService,
      appIdService,
      platformUtilsService,
      messagingService,
      logService,
      keyConnectorService,
      environmentService,
      stateService,
      twoFactorService,
      i18nService,
      encryptService,
      passwordStrengthService,
      policyService,
      deviceTrustCryptoService,
      authReqCryptoService,
      stateProvider,
    );

    loginStrategyCacheExpirationState = stateProvider.getFake(CACHE_EXPIRATION_KEY);
  });

  it("should clear the cache if more than 2 mins have passed since expiration date", async () => {
    const credentials = new PasswordLoginCredentials("EMAIL", "MASTER_PASSWORD");
    apiService.postIdentityToken.mockResolvedValue(
      new IdentityTwoFactorResponse({
        TwoFactorProviders: ["0"],
        TwoFactorProviders2: { 0: null },
        error: "invalid_grant",
        error_description: "Two factor required.",
        email: undefined,
        ssoEmail2faSessionToken: undefined,
      }),
    );

    await sut.logIn(credentials);

    loginStrategyCacheExpirationState.stateSubject.next(new Date(Date.now() - 1000 * 60 * 5));

    const twoFactorToken = new TokenTwoFactorRequest(
      TwoFactorProviderType.Authenticator,
      "TWO_FACTOR_TOKEN",
      true,
    );

    await expect(sut.logInTwoFactor(twoFactorToken, "CAPTCHA")).rejects.toThrow();
  });
});
