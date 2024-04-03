import { Observable, map, BehaviorSubject } from "rxjs";
import { Jsonify } from "type-fest";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { DeviceTrustCryptoServiceAbstraction } from "@bitwarden/common/auth/abstractions/device-trust-crypto.service.abstraction";
import { KeyConnectorService } from "@bitwarden/common/auth/abstractions/key-connector.service";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { TwoFactorService } from "@bitwarden/common/auth/abstractions/two-factor.service";
import { ForceSetPasswordReason } from "@bitwarden/common/auth/models/domain/force-set-password-reason";
import { SsoTokenRequest } from "@bitwarden/common/auth/models/request/identity-token/sso-token.request";
import { AuthRequestResponse } from "@bitwarden/common/auth/models/response/auth-request.response";
import { IdentityTokenResponse } from "@bitwarden/common/auth/models/response/identity-token.response";
import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions/account/billing-account-profile-state.service";
import { HttpStatusCode } from "@bitwarden/common/enums";
import { ErrorResponse } from "@bitwarden/common/models/response/error.response";
import { AppIdService } from "@bitwarden/common/platform/abstractions/app-id.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { UserId } from "@bitwarden/common/types/guid";

import {
  InternalUserDecryptionOptionsServiceAbstraction,
  AuthRequestServiceAbstraction,
} from "../abstractions";
import { SsoLoginCredentials } from "../models/domain/login-credentials";
import { CacheData } from "../services/login-strategies/login-strategy.state";

import { LoginStrategyData, LoginStrategy } from "./login.strategy";

export class SsoLoginStrategyData implements LoginStrategyData {
  captchaBypassToken: string;
  tokenRequest: SsoTokenRequest;
  /**
   * User's entered email obtained pre-login. Present in most SSO flows, but not CLI + SSO Flow.
   */
  userEnteredEmail?: string;
  /**
   * User email address. Only available after authentication.
   */
  email?: string;
  /**
   * The organization ID that the user is logging into. Used for Key Connector
   * purposes after authentication.
   */
  orgId: string;
  /**
   * A token provided by the server as an authentication factor for sending
   * email OTPs to the user's configured 2FA email address. This is required
   * as we don't have a master password hash or other verifiable secret when using SSO.
   */
  ssoEmail2FaSessionToken?: string;

  static fromJSON(obj: Jsonify<SsoLoginStrategyData>): SsoLoginStrategyData {
    return Object.assign(new SsoLoginStrategyData(), obj, {
      tokenRequest: SsoTokenRequest.fromJSON(obj.tokenRequest),
    });
  }
}

export class SsoLoginStrategy extends LoginStrategy {
  /**
   * @see {@link SsoLoginStrategyData.email}
   */
  email$: Observable<string | null>;
  /**
   * @see {@link SsoLoginStrategyData.orgId}
   */
  orgId$: Observable<string>;
  /**
   * @see {@link SsoLoginStrategyData.ssoEmail2FaSessionToken}
   */
  ssoEmail2FaSessionToken$: Observable<string | null>;

  protected cache: BehaviorSubject<SsoLoginStrategyData>;

  constructor(
    data: SsoLoginStrategyData,
    cryptoService: CryptoService,
    apiService: ApiService,
    tokenService: TokenService,
    appIdService: AppIdService,
    platformUtilsService: PlatformUtilsService,
    messagingService: MessagingService,
    logService: LogService,
    stateService: StateService,
    twoFactorService: TwoFactorService,
    userDecryptionOptionsService: InternalUserDecryptionOptionsServiceAbstraction,
    private keyConnectorService: KeyConnectorService,
    private deviceTrustCryptoService: DeviceTrustCryptoServiceAbstraction,
    private authRequestService: AuthRequestServiceAbstraction,
    private i18nService: I18nService,
    billingAccountProfileStateService: BillingAccountProfileStateService,
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
      userDecryptionOptionsService,
      billingAccountProfileStateService,
    );

    this.cache = new BehaviorSubject(data);
    this.email$ = this.cache.pipe(map((state) => state.email));
    this.orgId$ = this.cache.pipe(map((state) => state.orgId));
    this.ssoEmail2FaSessionToken$ = this.cache.pipe(map((state) => state.ssoEmail2FaSessionToken));
  }

  async logIn(credentials: SsoLoginCredentials) {
    const data = new SsoLoginStrategyData();
    data.orgId = credentials.orgId;

    data.userEnteredEmail = credentials.email;

    data.tokenRequest = new SsoTokenRequest(
      credentials.code,
      credentials.codeVerifier,
      credentials.redirectUrl,
      await this.buildTwoFactor(credentials.twoFactor, credentials.email),
      await this.buildDeviceRequest(),
    );

    this.cache.next(data);

    const [ssoAuthResult] = await this.startLogIn();

    const email = ssoAuthResult.email;
    const ssoEmail2FaSessionToken = ssoAuthResult.ssoEmail2FaSessionToken;

    // Auth guard currently handles redirects for this.
    if (ssoAuthResult.forcePasswordReset == ForceSetPasswordReason.AdminForcePasswordReset) {
      await this.stateService.setForceSetPasswordReason(ssoAuthResult.forcePasswordReset);
    }

    this.cache.next({
      ...this.cache.value,
      email,
      ssoEmail2FaSessionToken,
    });

    return ssoAuthResult;
  }

  protected override async setMasterKey(tokenResponse: IdentityTokenResponse) {
    // The only way we can be setting a master key at this point is if we are using Key Connector.
    // First, check to make sure that we should do so based on the token response.
    if (this.shouldSetMasterKeyFromKeyConnector(tokenResponse)) {
      // If we're here, we know that the user should use Key Connector (they have a KeyConnectorUrl) and does not have a master password.
      // We can now check the key on the token response to see whether they are a brand new user or an existing user.
      // The presence of a masterKeyEncryptedUserKey indicates that the user has already been provisioned in Key Connector.
      const newSsoUser = tokenResponse.key == null;
      if (newSsoUser) {
        await this.keyConnectorService.convertNewSsoUserToKeyConnector(
          tokenResponse,
          this.cache.value.orgId,
        );
      } else {
        const keyConnectorUrl = this.getKeyConnectorUrl(tokenResponse);
        await this.keyConnectorService.setMasterKeyFromUrl(keyConnectorUrl);
      }
    }
  }

  /**
   * Determines if it is possible set the `masterKey` from Key Connector.
   * @param tokenResponse
   * @returns `true` if the master key can be set from Key Connector, `false` otherwise
   */
  private shouldSetMasterKeyFromKeyConnector(tokenResponse: IdentityTokenResponse): boolean {
    const userDecryptionOptions = tokenResponse?.userDecryptionOptions;

    if (userDecryptionOptions != null) {
      const userHasMasterPassword = userDecryptionOptions.hasMasterPassword;
      const userHasKeyConnectorUrl =
        userDecryptionOptions.keyConnectorOption?.keyConnectorUrl != null;

      // In order for us to set the master key from Key Connector, we need to have a Key Connector URL
      // and the user must not have a master password.
      return userHasKeyConnectorUrl && !userHasMasterPassword;
    } else {
      // In pre-TDE versions of the server, the userDecryptionOptions will not be present.
      // In this case, we can determine if the user has a master password and has a Key Connector URL by
      // just checking the keyConnectorUrl property. This is because the server short-circuits on the response
      // and will not pass back the URL in the response if the user has a master password.
      // TODO: remove compatibility check after 2023.10 release (https://bitwarden.atlassian.net/browse/PM-3537)
      return tokenResponse.keyConnectorUrl != null;
    }
  }

  private getKeyConnectorUrl(tokenResponse: IdentityTokenResponse): string {
    // TODO: remove tokenResponse.keyConnectorUrl reference after 2023.10 release (https://bitwarden.atlassian.net/browse/PM-3537)
    const userDecryptionOptions = tokenResponse?.userDecryptionOptions;
    return (
      tokenResponse.keyConnectorUrl ?? userDecryptionOptions?.keyConnectorOption?.keyConnectorUrl
    );
  }

  // TODO: future passkey login strategy will need to support setting user key (decrypting via TDE or admin approval request)
  // so might be worth moving this logic to a common place (base login strategy or a separate service?)
  protected override async setUserKey(
    tokenResponse: IdentityTokenResponse,
    userId: UserId,
  ): Promise<void> {
    const masterKeyEncryptedUserKey = tokenResponse.key;

    // Note: masterKeyEncryptedUserKey is undefined for SSO JIT provisioned users
    // on account creation and subsequent logins (confirmed or unconfirmed)
    // but that is fine for TDE so we cannot return if it is undefined

    if (masterKeyEncryptedUserKey) {
      // set the master key encrypted user key if it exists
      await this.cryptoService.setMasterKeyEncryptedUserKey(masterKeyEncryptedUserKey);
    }

    const userDecryptionOptions = tokenResponse?.userDecryptionOptions;

    // Note: TDE and key connector are mutually exclusive
    if (userDecryptionOptions?.trustedDeviceOption) {
      await this.trySetUserKeyWithApprovedAdminRequestIfExists(userId);

      const hasUserKey = await this.cryptoService.hasUserKey();

      // Only try to set user key with device key if admin approval request was not successful
      if (!hasUserKey) {
        await this.trySetUserKeyWithDeviceKey(tokenResponse);
      }
    } else if (
      masterKeyEncryptedUserKey != null &&
      this.getKeyConnectorUrl(tokenResponse) != null
    ) {
      // Key connector enabled for user
      await this.trySetUserKeyWithMasterKey();
    }

    // Note: In the traditional SSO flow with MP without key connector, the lock component
    // is responsible for deriving master key from MP entry and then decrypting the user key
  }

  private async trySetUserKeyWithApprovedAdminRequestIfExists(userId: UserId): Promise<void> {
    // At this point a user could have an admin auth request that has been approved
    const adminAuthReqStorable = await this.authRequestService.getAdminAuthRequest(userId);

    if (!adminAuthReqStorable) {
      return;
    }

    // Call server to see if admin auth request has been approved
    let adminAuthReqResponse: AuthRequestResponse;

    try {
      adminAuthReqResponse = await this.apiService.getAuthRequest(adminAuthReqStorable.id);
    } catch (error) {
      if (error instanceof ErrorResponse && error.statusCode === HttpStatusCode.NotFound) {
        // if we get a 404, it means the auth request has been deleted so clear it from storage
        await this.authRequestService.clearAdminAuthRequest(userId);
      }

      // Always return on an error here as we don't want to block the user from logging in
      return;
    }

    if (adminAuthReqResponse?.requestApproved) {
      // if masterPasswordHash has a value, we will always receive authReqResponse.key
      // as authRequestPublicKey(masterKey) + authRequestPublicKey(masterPasswordHash)
      if (adminAuthReqResponse.masterPasswordHash) {
        await this.authRequestService.setKeysAfterDecryptingSharedMasterKeyAndHash(
          adminAuthReqResponse,
          adminAuthReqStorable.privateKey,
        );
      } else {
        // if masterPasswordHash is null, we will always receive authReqResponse.key
        // as authRequestPublicKey(userKey)
        await this.authRequestService.setUserKeyAfterDecryptingSharedUserKey(
          adminAuthReqResponse,
          adminAuthReqStorable.privateKey,
        );
      }

      if (await this.cryptoService.hasUserKey()) {
        // Now that we have a decrypted user key in memory, we can check if we
        // need to establish trust on the current device
        await this.deviceTrustCryptoService.trustDeviceIfRequired(userId);

        // if we successfully decrypted the user key, we can delete the admin auth request out of state
        // TODO: eventually we post and clean up DB as well once consumed on client
        await this.authRequestService.clearAdminAuthRequest(userId);

        this.platformUtilsService.showToast("success", null, this.i18nService.t("loginApproved"));
      }
    }
  }

  private async trySetUserKeyWithDeviceKey(tokenResponse: IdentityTokenResponse): Promise<void> {
    const trustedDeviceOption = tokenResponse.userDecryptionOptions?.trustedDeviceOption;

    const userId = (await this.stateService.getUserId()) as UserId;

    const deviceKey = await this.deviceTrustCryptoService.getDeviceKey(userId);
    const encDevicePrivateKey = trustedDeviceOption?.encryptedPrivateKey;
    const encUserKey = trustedDeviceOption?.encryptedUserKey;

    if (!deviceKey || !encDevicePrivateKey || !encUserKey) {
      return;
    }

    const userKey = await this.deviceTrustCryptoService.decryptUserKeyWithDeviceKey(
      userId,
      encDevicePrivateKey,
      encUserKey,
      deviceKey,
    );

    if (userKey) {
      await this.cryptoService.setUserKey(userKey);
    }
  }

  private async trySetUserKeyWithMasterKey(): Promise<void> {
    const masterKey = await this.cryptoService.getMasterKey();

    // There is a scenario in which the master key is not set here. That will occur if the user
    // has a master password and is using Key Connector. In that case, we cannot set the master key
    // because the user hasn't entered their master password yet.
    // Instead, we'll return here and let the migration to Key Connector handle setting the master key.
    if (!masterKey) {
      return;
    }

    const userKey = await this.cryptoService.decryptUserKeyWithMasterKey(masterKey);
    await this.cryptoService.setUserKey(userKey);
  }

  protected override async setPrivateKey(tokenResponse: IdentityTokenResponse): Promise<void> {
    const newSsoUser = tokenResponse.key == null;

    if (!newSsoUser) {
      await this.cryptoService.setPrivateKey(
        tokenResponse.privateKey ?? (await this.createKeyPairForOldAccount()),
      );
    }
  }

  exportCache(): CacheData {
    return {
      sso: this.cache.value,
    };
  }
}
