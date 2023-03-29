import { ApiService } from "../../abstractions/api.service";
import { AppIdService } from "../../abstractions/appId.service";
import { CryptoService } from "../../abstractions/crypto.service";
import { LogService } from "../../abstractions/log.service";
import { MessagingService } from "../../abstractions/messaging.service";
import { PlatformUtilsService } from "../../abstractions/platformUtils.service";
import { StateService } from "../../abstractions/state.service";
import { PolicyService } from "../../admin-console/abstractions/policy/policy.service.abstraction";
import { MasterPasswordPolicyOptions } from "../../admin-console/models/domain/master-password-policy-options";
import { HashPurpose } from "../../enums/hashPurpose";
import { SymmetricCryptoKey } from "../../models/domain/symmetric-crypto-key";
import { PasswordGenerationServiceAbstraction } from "../../tools/generator/password";
import { AuthService } from "../abstractions/auth.service";
import { TokenService } from "../abstractions/token.service";
import { TwoFactorService } from "../abstractions/two-factor.service";
import { AuthResult } from "../models/domain/auth-result";
import { ForceResetPasswordReason } from "../models/domain/force-password-reset-options";
import { PasswordLogInCredentials } from "../models/domain/log-in-credentials";
import { PasswordTokenRequest } from "../models/request/identity-token/password-token.request";
import { TokenTwoFactorRequest } from "../models/request/identity-token/token-two-factor.request";

import { LogInStrategy } from "./login.strategy";

export class PasswordLogInStrategy extends LogInStrategy {
  get email() {
    return this.tokenRequest.email;
  }

  get masterPasswordHash() {
    return this.tokenRequest.masterPasswordHash;
  }

  tokenRequest: PasswordTokenRequest;

  private localHashedPassword: string;
  private key: SymmetricCryptoKey;

  /**
   * Options to track if the user needs to update their password due to a password that does not meet an organization's
   * master password policy.
   */
  private forcePasswordResetReason: ForceResetPasswordReason = ForceResetPasswordReason.None;

  constructor(
    cryptoService: CryptoService,
    apiService: ApiService,
    tokenService: TokenService,
    appIdService: AppIdService,
    platformUtilsService: PlatformUtilsService,
    messagingService: MessagingService,
    logService: LogService,
    protected stateService: StateService,
    twoFactorService: TwoFactorService,
    private passwordGenerationService: PasswordGenerationServiceAbstraction,
    private policyService: PolicyService,
    private authService: AuthService
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

  async setUserKey() {
    await this.cryptoService.setKey(this.key);
    await this.cryptoService.setKeyHash(this.localHashedPassword);
  }

  async logInTwoFactor(
    twoFactor: TokenTwoFactorRequest,
    captchaResponse: string
  ): Promise<AuthResult> {
    this.tokenRequest.captchaResponse = captchaResponse ?? this.captchaBypassToken;
    const result = await super.logInTwoFactor(twoFactor);

    // 2FA was successful, save the force update password options with the state service if defined
    if (
      (await this.stateService.getIsAuthenticated()) &&
      this.forcePasswordResetReason != ForceResetPasswordReason.None
    ) {
      await this.stateService.setForcePasswordResetReason(this.forcePasswordResetReason);
      result.forcePasswordReset = this.forcePasswordResetReason;
    }

    return result;
  }

  async logIn(credentials: PasswordLogInCredentials) {
    const { email, masterPassword, captchaToken, twoFactor } = credentials;

    this.key = await this.authService.makePreloginKey(masterPassword, email);

    // Hash the password early (before authentication) so we don't persist it in memory in plaintext
    this.localHashedPassword = await this.cryptoService.hashPassword(
      masterPassword,
      this.key,
      HashPurpose.LocalAuthorization
    );
    const hashedPassword = await this.cryptoService.hashPassword(masterPassword, this.key);

    this.tokenRequest = new PasswordTokenRequest(
      email,
      hashedPassword,
      captchaToken,
      await this.buildTwoFactor(twoFactor),
      await this.buildDeviceRequest()
    );

    const result = await this.startLogIn();

    // The identity result can contain master password policies for the user's organizations
    if (this.masterPasswordPolicy != null && this.masterPasswordPolicy.enforceOnLogin) {
      // If there is a policy active, evaluate the supplied password before its no longer in memory
      const meetsRequirements = this.evaluateMasterPassword(credentials, this.masterPasswordPolicy);

      if (!meetsRequirements) {
        // Authentication was successful, save the force update password options with the state service
        if (await this.stateService.getIsAuthenticated()) {
          await this.stateService.setForcePasswordResetReason(
            ForceResetPasswordReason.WeakMasterPassword
          );
          result.forcePasswordReset = ForceResetPasswordReason.WeakMasterPassword;
        } else {
          // Authentication was not fully successful (likely 2FA), save the flag to this strategy for later use
          this.forcePasswordResetReason = ForceResetPasswordReason.WeakMasterPassword;
        }
      }
    }

    return result;
  }

  private evaluateMasterPassword(
    { masterPassword, email }: PasswordLogInCredentials,
    options: MasterPasswordPolicyOptions
  ): boolean {
    const passwordStrength = this.passwordGenerationService.passwordStrength(
      masterPassword,
      this.getPasswordStrengthUserInput(email)
    )?.score;

    return this.policyService.evaluateMasterPassword(passwordStrength, masterPassword, options);
  }

  protected getPasswordStrengthUserInput(email: string) {
    let userInput: string[] = [];
    const atPosition = email.indexOf("@");
    if (atPosition > -1) {
      userInput = userInput.concat(
        email
          .substr(0, atPosition)
          .trim()
          .toLowerCase()
          .split(/[^A-Za-z0-9]/)
      );
    }
    return userInput;
  }
}
