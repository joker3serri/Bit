import { mock, MockProxy } from "jest-mock-extended";

import { ApiService } from "../../abstractions/api.service";
import { AppIdService } from "../../abstractions/appId.service";
import { CryptoService } from "../../abstractions/crypto.service";
import { LogService } from "../../abstractions/log.service";
import { MessagingService } from "../../abstractions/messaging.service";
import { PlatformUtilsService } from "../../abstractions/platformUtils.service";
import { StateService } from "../../abstractions/state.service";
import { PolicyService } from "../../admin-console/abstractions/policy/policy.service.abstraction";
import { HashPurpose } from "../../enums/hashPurpose";
import { Utils } from "../../misc/utils";
import { SymmetricCryptoKey } from "../../models/domain/symmetric-crypto-key";
import { PasswordGenerationService } from "../../tools/generator/password";
import { AuthService } from "../abstractions/auth.service";
import { TokenService } from "../abstractions/token.service";
import { TwoFactorService } from "../abstractions/two-factor.service";
import { TwoFactorProviderType } from "../enums/two-factor-provider-type";
import { ForceResetPasswordReason } from "../models/domain/force-password-reset-options";
import { PasswordLogInCredentials } from "../models/domain/log-in-credentials";
import { MasterPasswordPolicyResponse } from "../models/response/master-password-policy.response";

import { identityTokenResponseFactory } from "./login.strategy.spec";
import { PasswordLogInStrategy } from "./password-login.strategy";

const email = "hello@world.com";
const masterPassword = "password";
const hashedPassword = "HASHED_PASSWORD";
const localHashedPassword = "LOCAL_HASHED_PASSWORD";
const preloginKey = new SymmetricCryptoKey(
  Utils.fromB64ToArray(
    "N2KWjlLpfi5uHjv+YcfUKIpZ1l+W+6HRensmIqD+BFYBf6N/dvFpJfWwYnVBdgFCK2tJTAIMLhqzIQQEUmGFgg=="
  )
);
const deviceId = Utils.newGuid();
const masterPasswordPolicy = new MasterPasswordPolicyResponse({
  EnforceOnLogin: true,
  MinLength: 8,
});

describe("PasswordLogInStrategy", () => {
  let cryptoService: MockProxy<CryptoService>;
  let apiService: MockProxy<ApiService>;
  let tokenService: MockProxy<TokenService>;
  let appIdService: MockProxy<AppIdService>;
  let platformUtilsService: MockProxy<PlatformUtilsService>;
  let messagingService: MockProxy<MessagingService>;
  let logService: MockProxy<LogService>;
  let stateService: MockProxy<StateService>;
  let twoFactorService: MockProxy<TwoFactorService>;
  let authService: MockProxy<AuthService>;
  let policyService: MockProxy<PolicyService>;
  let passwordGenerationService: MockProxy<PasswordGenerationService>;

  let passwordLogInStrategy: PasswordLogInStrategy;
  let credentials: PasswordLogInCredentials;

  beforeEach(async () => {
    cryptoService = mock<CryptoService>();
    apiService = mock<ApiService>();
    tokenService = mock<TokenService>();
    appIdService = mock<AppIdService>();
    platformUtilsService = mock<PlatformUtilsService>();
    messagingService = mock<MessagingService>();
    logService = mock<LogService>();
    stateService = mock<StateService>();
    twoFactorService = mock<TwoFactorService>();
    authService = mock<AuthService>();
    policyService = mock<PolicyService>();
    passwordGenerationService = mock<PasswordGenerationService>();

    appIdService.getAppId.mockResolvedValue(deviceId);
    tokenService.decodeToken.mockResolvedValue({});

    authService.makePreloginKey.mockResolvedValue(preloginKey);

    cryptoService.hashPassword
      .calledWith(masterPassword, expect.anything(), undefined)
      .mockResolvedValue(hashedPassword);
    cryptoService.hashPassword
      .calledWith(masterPassword, expect.anything(), HashPurpose.LocalAuthorization)
      .mockResolvedValue(localHashedPassword);

    policyService.evaluateMasterPassword.mockReturnValue(true);

    passwordLogInStrategy = new PasswordLogInStrategy(
      cryptoService,
      apiService,
      tokenService,
      appIdService,
      platformUtilsService,
      messagingService,
      logService,
      stateService,
      twoFactorService,
      passwordGenerationService,
      policyService,
      authService
    );
    credentials = new PasswordLogInCredentials(email, masterPassword);

    apiService.postIdentityToken.mockResolvedValue(
      identityTokenResponseFactory(masterPasswordPolicy)
    );
  });

  it("sends master password credentials to the server", async () => {
    await passwordLogInStrategy.logIn(credentials);

    expect(apiService.postIdentityToken).toHaveBeenCalledWith(
      expect.objectContaining({
        email: email,
        masterPasswordHash: hashedPassword,
        device: expect.objectContaining({
          identifier: deviceId,
        }),
        twoFactor: expect.objectContaining({
          provider: null,
          token: null,
        }),
        captchaResponse: undefined,
      })
    );
  });

  it("sets the local environment after a successful login", async () => {
    await passwordLogInStrategy.logIn(credentials);

    expect(cryptoService.setKey).toHaveBeenCalledWith(preloginKey);
    expect(cryptoService.setKeyHash).toHaveBeenCalledWith(localHashedPassword);
  });

  it("evaluates the master password when policies are returned by the server", async () => {
    passwordGenerationService.passwordStrength.mockReturnValue({ score: 0 } as any);

    await passwordLogInStrategy.logIn(credentials);

    expect(policyService.evaluateMasterPassword).toHaveBeenCalled();
  });

  it("saves force password reset options in state when the master password is weak and login was successful", async () => {
    passwordGenerationService.passwordStrength.mockReturnValue({ score: 0 } as any);
    policyService.evaluateMasterPassword.mockReturnValue(false);
    stateService.getIsAuthenticated.mockResolvedValue(true);

    const result = await passwordLogInStrategy.logIn(credentials);

    const expectedResetOptions = expect.objectContaining({
      reason: ForceResetPasswordReason.WeakMasterPasswordOnLogin,
    });

    expect(policyService.evaluateMasterPassword).toHaveBeenCalled();
    expect(stateService.setForcePasswordResetOptions).toHaveBeenCalledWith(expectedResetOptions);
    expect(result.forcePasswordReset).toBeTruthy();
    expect(result.forcePasswordResetOptions).toEqual(expectedResetOptions);
  });

  it("saves force password reset options to the strategy when the master password is weak and login requires 2FA", async () => {
    passwordGenerationService.passwordStrength.mockReturnValue({ score: 0 } as any);
    policyService.evaluateMasterPassword.mockReturnValue(false);

    // First login request fails requiring 2FA
    stateService.getIsAuthenticated.mockResolvedValueOnce(false);
    const firstResult = await passwordLogInStrategy.logIn(credentials);

    // Second login request succeeds
    stateService.getIsAuthenticated.mockResolvedValueOnce(true);
    const secondResult = await passwordLogInStrategy.logInTwoFactor(
      {
        provider: TwoFactorProviderType.Authenticator,
        token: "123456",
        remember: false,
      },
      ""
    );

    const expectedResetOptions = expect.objectContaining({
      reason: ForceResetPasswordReason.WeakMasterPasswordOnLogin,
    });

    // First login attempt should not save the force password reset options
    expect(firstResult.forcePasswordReset).toBeFalsy();
    expect(firstResult.forcePasswordResetOptions).toBeUndefined();

    // Second login attempt should save the force password reset options and return in result
    expect(stateService.setForcePasswordResetOptions).toHaveBeenCalledWith(expectedResetOptions);
    expect(secondResult.forcePasswordReset).toBeTruthy();
    expect(secondResult.forcePasswordResetOptions).toEqual(expectedResetOptions);
  });
});
