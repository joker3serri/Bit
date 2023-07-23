import { Directive, OnDestroy, OnInit } from "@angular/core";
import { IsActiveMatchOptions, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { AnonymousHubService } from "@bitwarden/common/abstractions/anonymousHub.service";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { DeviceTrustCryptoServiceAbstraction } from "@bitwarden/common/auth/abstractions/device-trust-crypto.service.abstraction";
import { LoginService } from "@bitwarden/common/auth/abstractions/login.service";
import { AuthRequestType } from "@bitwarden/common/auth/enums/auth-request-type";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { AdminAuthRequestStorable } from "@bitwarden/common/auth/models/domain/admin-auth-req-storable";
import { AuthResult } from "@bitwarden/common/auth/models/domain/auth-result";
import { ForceResetPasswordReason } from "@bitwarden/common/auth/models/domain/force-reset-password-reason";
import { PasswordlessLogInCredentials } from "@bitwarden/common/auth/models/domain/log-in-credentials";
import { PasswordlessCreateAuthRequest } from "@bitwarden/common/auth/models/request/passwordless-create-auth.request";
import { AuthRequestResponse } from "@bitwarden/common/auth/models/response/auth-request.response";
import { ErrorResponse } from "@bitwarden/common/models/response/error.response";
import { AppIdService } from "@bitwarden/common/platform/abstractions/app-id.service";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import {
  MasterKey,
  SymmetricCryptoKey,
  UserKey,
} from "@bitwarden/common/platform/models/domain/symmetric-crypto-key";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/common/tools/generator/password";

import { CaptchaProtectedComponent } from "./captcha-protected.component";

// TODO: consider renaming this component something like LoginViaAuthRequest

enum State {
  StandardAuthRequest,
  AdminAuthRequest,
}

@Directive()
export class LoginWithDeviceComponent
  extends CaptchaProtectedComponent
  implements OnInit, OnDestroy
{
  private destroy$ = new Subject<void>();
  userAuthNStatus: AuthenticationStatus;
  email: string;
  showResendNotification = false;
  passwordlessRequest: PasswordlessCreateAuthRequest;
  fingerprintPhrase: string;
  onSuccessfulLoginTwoFactorNavigate: () => Promise<any>;
  onSuccessfulLogin: () => Promise<any>;
  onSuccessfulLoginNavigate: () => Promise<any>;
  onSuccessfulLoginForceResetNavigate: () => Promise<any>;

  protected adminApprovalRoute = "admin-approval-requested";

  protected State = State;
  protected state = State.StandardAuthRequest;

  protected twoFactorRoute = "2fa";
  protected successRoute = "vault";
  protected forcePasswordResetRoute = "update-temp-password";
  private resendTimeout = 12000;

  private authRequestKeyPair: { publicKey: ArrayBuffer; privateKey: ArrayBuffer };

  constructor(
    protected router: Router,
    private cryptoService: CryptoService,
    private cryptoFunctionService: CryptoFunctionService,
    private appIdService: AppIdService,
    private passwordGenerationService: PasswordGenerationServiceAbstraction,
    private apiService: ApiService,
    private authService: AuthService,
    private logService: LogService,
    environmentService: EnvironmentService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    private anonymousHubService: AnonymousHubService,
    private validationService: ValidationService,
    private stateService: StateService,
    private loginService: LoginService,
    private deviceTrustCryptoService: DeviceTrustCryptoServiceAbstraction
  ) {
    super(environmentService, i18nService, platformUtilsService);

    const navigation = this.router.getCurrentNavigation();
    if (navigation) {
      this.email = this.loginService.getEmail();
    }

    //gets signalR push notification
    this.authService
      .getPushNotificationObs$()
      .pipe(takeUntil(this.destroy$))
      .subscribe((id) => {
        this.confirmResponse(id);
      });
  }

  async ngOnInit() {
    this.userAuthNStatus = await this.authService.getAuthStatus();

    if (!this.email) {
      this.router.navigate(["/login"]);
      return;
    }

    const matchOptions: IsActiveMatchOptions = {
      paths: "exact",
      queryParams: "ignored",
      fragment: "ignored",
      matrixParams: "ignored",
    };

    if (this.router.isActive(this.adminApprovalRoute, matchOptions)) {
      this.state = State.AdminAuthRequest;

      // We only allow a single admin approval request to be active at a time
      // so must check state to see if we have an existing one or not
      const adminAuthReqStorable = await this.stateService.getAdminAuthRequest();

      if (!adminAuthReqStorable) {
        this.startPasswordlessLogin();
      }
    } else {
      this.startPasswordlessLogin();
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.anonymousHubService.stopHubConnection();
  }

  private async buildAuthRequest(authRequestType: AuthRequestType) {
    const authRequestKeyPairArray = await this.cryptoFunctionService.rsaGenerateKeyPair(2048);

    this.authRequestKeyPair = {
      publicKey: authRequestKeyPairArray[0],
      privateKey: authRequestKeyPairArray[1],
    };

    const deviceIdentifier = await this.appIdService.getAppId();
    const publicKey = Utils.fromBufferToB64(this.authRequestKeyPair.publicKey);
    const accessCode = await this.passwordGenerationService.generatePassword({ length: 25 });

    this.fingerprintPhrase = (
      await this.cryptoService.getFingerprint(this.email, this.authRequestKeyPair.publicKey)
    ).join("-");

    this.passwordlessRequest = new PasswordlessCreateAuthRequest(
      this.email,
      deviceIdentifier,
      publicKey,
      authRequestType,
      accessCode
    );
  }

  async startPasswordlessLogin() {
    this.showResendNotification = false;

    try {
      let reqResponse: AuthRequestResponse;

      if (this.state === State.AdminAuthRequest) {
        await this.buildAuthRequest(AuthRequestType.AdminApproval);
        reqResponse = await this.apiService.postAdminAuthRequest(this.passwordlessRequest);

        const adminAuthReqStorable = new AdminAuthRequestStorable({
          id: reqResponse.id,
          privateKey: this.authRequestKeyPair.privateKey,
        });

        await this.stateService.setAdminAuthRequest(adminAuthReqStorable);
      } else {
        await this.buildAuthRequest(AuthRequestType.AuthenticateAndUnlock);
        reqResponse = await this.apiService.postAuthRequest(this.passwordlessRequest);
      }

      if (reqResponse.id) {
        this.anonymousHubService.createHubConnection(reqResponse.id);
      }
    } catch (e) {
      this.logService.error(e);
    }

    setTimeout(() => {
      this.showResendNotification = true;
    }, this.resendTimeout);
  }

  private async confirmResponse(requestId: string) {
    try {
      const authReqResponse = await this.apiService.getAuthResponse(
        requestId,
        this.passwordlessRequest.accessCode
      );

      if (!authReqResponse.requestApproved) {
        return;
      }

      // 4 Scenarios to handle for approved auth requests:
      // Existing flow 1:
      //  - Anon Login with Device > User is not AuthN > receives approval from device with pubKey(masterKey)
      //    > decrypt masterKey > must authenticate > gets masterKey(userKey) > decrypt userKey and proceed to vault

      // 3 new flows from TDE:
      // Flow 2:
      //  - Post SSO > User is AuthN > SSO login strategy success sets masterKey(userKey) > receives approval from device with pubKey(masterKey)
      //    > decrypt masterKey > decrypt userKey > establish trust if required > proceed to vault
      // Flow 3:
      //  - Post SSO > User is AuthN > Receives approval from device with pubKey(userKey) > decrypt userKey > establish trust if required > proceed to vault
      // Flow 4:
      //  - Anon Login with Device > User is not AuthN > receives approval from device with pubKey(userKey)
      //    > decrypt userKey > must authenticate > set userKey > proceed to vault

      // if user has authenticated via SSO
      if (this.userAuthNStatus === AuthenticationStatus.Locked) {
        // Then it's flow 2 or 3 based on presence of masterPasswordHash
        if (authReqResponse.masterPasswordHash) {
          // Flow 2: masterPasswordHash is not null
          return await this.decryptWithSharedMasterKey(authReqResponse);
        } else {
          // Flow 3: masterPasswordHash is null
          // then we can assume key is authRequestPublicKey(userKey) and we can just decrypt with userKey and proceed to vault
          return await this.decryptWithSharedUserKey(authReqResponse);
        }
      }

      // Flow 1 and 4:
      return await this.authenticateAndDecrypt(requestId, authReqResponse);
    } catch (error) {
      if (error instanceof ErrorResponse) {
        this.router.navigate(["/login"]);
        this.validationService.showError(error);
        return;
      }

      this.logService.error(error);
    }
  }

  // Authentication helper
  private async buildPasswordlessLoginCredentials(
    requestId: string,
    response: AuthRequestResponse
  ): Promise<PasswordlessLogInCredentials> {
    // if masterPasswordHash has a value, we will always receive key as authRequestPublicKey(masterKey) + authRequestPublicKey(masterPasswordHash)
    // if masterPasswordHash is null, we will always receive key as authRequestPublicKey(userKey)
    if (response.masterPasswordHash) {
      const { masterKey, masterKeyHash } = await this.decryptAuthReqResponseMasterKeyAndHash(
        response.key,
        response.masterPasswordHash
      );

      return new PasswordlessLogInCredentials(
        this.email,
        this.passwordlessRequest.accessCode,
        requestId,
        null, // no userKey
        masterKey,
        masterKeyHash
      );
    } else {
      const userKey = await this.decryptAuthReqResponseUserKey(response.key);
      return new PasswordlessLogInCredentials(
        this.email,
        this.passwordlessRequest.accessCode,
        requestId,
        userKey,
        null, // no masterKey
        null // no masterKeyHash
      );
    }
  }

  // Login w/ device flows
  private async decryptWithSharedUserKey(authReqResponse: AuthRequestResponse) {
    const userKey = await this.decryptAuthReqResponseUserKey(authReqResponse.key);
    await this.cryptoService.setUserKey(userKey);

    // Now that we have a decrypted user key in memory, we can check if we
    // need to establish trust on the current device
    await this.deviceTrustCryptoService.trustDeviceIfRequired();

    await this.handleSuccessfulLoginNavigation();
  }

  private async decryptWithSharedMasterKey(authReqResponse: AuthRequestResponse) {
    const { masterKey } = await this.decryptAuthReqResponseMasterKeyAndHash(
      authReqResponse.key,
      authReqResponse.masterPasswordHash
    );

    const userKey = await this.cryptoService.decryptUserKeyWithMasterKey(masterKey);
    await this.cryptoService.setUserKey(userKey);

    // Now that we have a decrypted user key in memory, we can check if we
    // need to establish trust on the current device
    await this.deviceTrustCryptoService.trustDeviceIfRequired();

    await this.handleSuccessfulLoginNavigation();
  }

  private async authenticateAndDecrypt(requestId: string, authReqResponse: AuthRequestResponse) {
    // Note: credentials change based on if the authReqResponse.key is a encryptedMasterKey or UserKey
    const credentials = await this.buildPasswordlessLoginCredentials(requestId, authReqResponse);
    const loginResponse = await this.authService.logIn(credentials);

    await this.handlePostLoginNavigation(loginResponse);
  }

  // Routing logic
  private async handlePostLoginNavigation(loginResponse: AuthResult) {
    if (loginResponse.requiresTwoFactor) {
      if (this.onSuccessfulLoginTwoFactorNavigate != null) {
        this.onSuccessfulLoginTwoFactorNavigate();
      } else {
        this.router.navigate([this.twoFactorRoute]);
      }
    } else if (loginResponse.forcePasswordReset != ForceResetPasswordReason.None) {
      if (this.onSuccessfulLoginForceResetNavigate != null) {
        this.onSuccessfulLoginForceResetNavigate();
      } else {
        this.router.navigate([this.forcePasswordResetRoute]);
      }
    } else {
      await this.handleSuccessfulLoginNavigation();
    }
  }

  async setRememberEmailValues() {
    // TODO: solve bug with getRememberEmail not persisting across SSO to here
    const rememberEmail = this.loginService.getRememberEmail();
    const rememberedEmail = this.loginService.getEmail(); // this does persist across SSO
    await this.stateService.setRememberedEmail(rememberEmail ? rememberedEmail : null);
    this.loginService.clearValues();
  }

  private async handleSuccessfulLoginNavigation() {
    await this.setRememberEmailValues();
    if (this.onSuccessfulLogin != null) {
      this.onSuccessfulLogin();
    }
    if (this.onSuccessfulLoginNavigate != null) {
      this.onSuccessfulLoginNavigate();
    } else {
      this.router.navigate([this.successRoute]);
    }
  }

  // Decryption helpers
  private async decryptAuthReqResponseUserKey(pubKeyEncryptedUserKey: string): Promise<UserKey> {
    const decryptedUserKeyArrayBuffer = await this.cryptoService.rsaDecrypt(
      pubKeyEncryptedUserKey,
      this.authRequestKeyPair.privateKey
    );

    return new SymmetricCryptoKey(decryptedUserKeyArrayBuffer) as UserKey;
  }

  private async decryptAuthReqResponseMasterKeyAndHash(
    pubKeyEncryptedMasterKey: string,
    pubKeyEncryptedMasterKeyHash: string
  ): Promise<{ masterKey: MasterKey; masterKeyHash: string }> {
    const decryptedMasterKeyArrayBuffer = await this.cryptoService.rsaDecrypt(
      pubKeyEncryptedMasterKey,
      this.authRequestKeyPair.privateKey
    );

    const decryptedMasterKeyHashArrayBuffer = await this.cryptoService.rsaDecrypt(
      pubKeyEncryptedMasterKeyHash,
      this.authRequestKeyPair.privateKey
    );

    const masterKey = new SymmetricCryptoKey(decryptedMasterKeyArrayBuffer) as MasterKey;
    const masterKeyHash = Utils.fromBufferToUtf8(decryptedMasterKeyHashArrayBuffer);

    return {
      masterKey,
      masterKeyHash,
    };
  }
}
