import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { IsActiveMatchOptions, Router, RouterModule } from "@angular/router";
import { firstValueFrom, map } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  AuthRequestLoginCredentials,
  AuthRequestServiceAbstraction,
  LoginEmailServiceAbstraction,
  LoginStrategyServiceAbstraction,
} from "@bitwarden/auth/common";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AnonymousHubService } from "@bitwarden/common/auth/abstractions/anonymous-hub.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { DeviceTrustServiceAbstraction } from "@bitwarden/common/auth/abstractions/device-trust.service.abstraction";
import { AuthRequestType } from "@bitwarden/common/auth/enums/auth-request-type";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { AdminAuthRequestStorable } from "@bitwarden/common/auth/models/domain/admin-auth-req-storable";
import { AuthResult } from "@bitwarden/common/auth/models/domain/auth-result";
import { ForceSetPasswordReason } from "@bitwarden/common/auth/models/domain/force-set-password-reason";
import { AuthRequest } from "@bitwarden/common/auth/models/request/auth.request";
import { AuthRequestResponse } from "@bitwarden/common/auth/models/response/auth-request.response";
import { ClientType, HttpStatusCode } from "@bitwarden/common/enums";
import { ErrorResponse } from "@bitwarden/common/models/response/error.response";
import { AppIdService } from "@bitwarden/common/platform/abstractions/app-id.service";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { UserId } from "@bitwarden/common/types/guid";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { ButtonModule, LinkModule, ToastService } from "@bitwarden/components";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/generator-legacy";

enum State {
  StandardAuthRequest, // used in Login with Device flow
  AdminAuthRequest, // used in SSO with Trusted Devices flow
}

const matchOptions: IsActiveMatchOptions = {
  paths: "exact",
  queryParams: "ignored",
  fragment: "ignored",
  matrixParams: "ignored",
};

@Component({
  standalone: true,
  templateUrl: "./login-via-auth-request.component.html",
  imports: [ButtonModule, CommonModule, JslibModule, LinkModule, RouterModule],
})
export class LoginViaAuthRequestComponent implements OnInit, OnDestroy {
  private authRequest: AuthRequest;
  private authRequestKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array };
  private authStatus: AuthenticationStatus;
  private showResendNotificationTimeoutSeconds = 12;

  protected backToRoute = "/login";
  protected clientType: ClientType;
  protected ClientType = ClientType;
  protected email: string;
  protected fingerprintPhrase: string;
  protected showResendNotification = false;
  protected StateEnum = State;
  protected state = State.StandardAuthRequest;

  constructor(
    private accountService: AccountService,
    private anonymousHubService: AnonymousHubService,
    private apiService: ApiService,
    private appIdService: AppIdService,
    private authRequestService: AuthRequestServiceAbstraction,
    private authService: AuthService,
    private cryptoFunctionService: CryptoFunctionService,
    private deviceTrustService: DeviceTrustServiceAbstraction,
    private i18nService: I18nService,
    private logService: LogService,
    private loginEmailService: LoginEmailServiceAbstraction,
    private loginStrategyService: LoginStrategyServiceAbstraction,
    private passwordGenerationService: PasswordGenerationServiceAbstraction,
    private platformUtilsService: PlatformUtilsService,
    private router: Router,
    private syncService: SyncService,
    private toastService: ToastService,
    private validationService: ValidationService,
  ) {
    this.clientType = this.platformUtilsService.getClientType();

    // Gets SignalR push notification
    // Only fires on approval to prevent enumeration
    this.authRequestService.authRequestPushNotification$
      .pipe(takeUntilDestroyed())
      .subscribe((requestId) => {
        this.verifyAndHandleApprovedAuthReq(requestId).catch((e: Error) => {
          this.toastService.showToast({
            variant: "error",
            title: this.i18nService.t("error"),
            message: e.message,
          });

          this.logService.error("Failed to use approved auth request: " + e.message);
        });
      });
  }

  async ngOnInit(): Promise<void> {
    // Check if we are in an admin auth request flow
    if (this.router.isActive("admin-approval-requested", matchOptions)) {
      this.state = State.AdminAuthRequest;
      this.backToRoute = "/login-initiated";
    }

    // Get email based on auth request flow
    if (this.state === State.AdminAuthRequest) {
      // Get email from state for admin auth requests because it is available and also
      // prevents it from being lost on refresh as the loginEmailService email does not persist.
      this.email = await firstValueFrom(
        this.accountService.activeAccount$.pipe(map((a) => a?.email)),
      );
    } else {
      this.email = await firstValueFrom(this.loginEmailService.loginEmail$);
    }

    // If email is missing, show error toast and redirect
    if (!this.email) {
      this.toastService.showToast({
        variant: "error",
        title: null,
        message: this.i18nService.t("userEmailMissing"),
      });

      await this.router.navigate([this.backToRoute]);

      return;
    }

    this.authStatus = await firstValueFrom(this.authService.activeAccountStatus$);

    if (this.state === State.AdminAuthRequest) {
      // We only allow a single admin approval request to be active at a time
      // so we must check state to see if we have an existing one or not
      const userId = (await firstValueFrom(this.accountService.activeAccount$)).id;
      const existingAdminAuthRequest = await this.authRequestService.getAdminAuthRequest(userId);

      if (existingAdminAuthRequest) {
        await this.handleExistingAdminAuthRequest(existingAdminAuthRequest, userId);
      } else {
        await this.startAuthRequestLogin();
      }
    } else {
      // Standard auth request flow
      await this.startAuthRequestLogin();
    }
  }

  async ngOnDestroy(): Promise<void> {
    await this.anonymousHubService.stopHubConnection();
  }

  private async handleExistingAdminAuthRequest(
    adminAuthReqStorable: AdminAuthRequestStorable,
    userId: UserId,
  ): Promise<void> {
    // Note: on login, the SSOLoginStrategy will also call to see an existing admin auth req
    // has been approved and handle it if so.

    // Regardless, we always retrieve the auth request from the server verify and handle status changes here as well
    let adminAuthReqResponse: AuthRequestResponse;
    try {
      adminAuthReqResponse = await this.apiService.getAuthRequest(adminAuthReqStorable.id);
    } catch (error) {
      if (error instanceof ErrorResponse && error.statusCode === HttpStatusCode.NotFound) {
        return await this.handleExistingAdminAuthReqDeletedOrDenied(userId);
      }
    }

    // Request doesn't exist anymore
    if (!adminAuthReqResponse) {
      return await this.handleExistingAdminAuthReqDeletedOrDenied(userId);
    }

    // Re-derive the user's fingerprint phrase
    // It is important to not use the server's public key here as it could have been compromised via MITM
    const derivedPublicKeyArrayBuffer = await this.cryptoFunctionService.rsaExtractPublicKey(
      adminAuthReqStorable.privateKey,
    );
    this.fingerprintPhrase = await this.authRequestService.getFingerprintPhrase(
      this.email,
      derivedPublicKeyArrayBuffer,
    );

    // Request denied
    if (adminAuthReqResponse.isAnswered && !adminAuthReqResponse.requestApproved) {
      return await this.handleExistingAdminAuthReqDeletedOrDenied(userId);
    }

    // Request approved
    if (adminAuthReqResponse.requestApproved) {
      return await this.handleApprovedAdminAuthRequest(
        adminAuthReqResponse,
        adminAuthReqStorable.privateKey,
        userId,
      );
    }

    // Request still pending response from admin
    // set keypair and create hub connection so that any approvals will be received via push notification
    this.authRequestKeyPair = { privateKey: adminAuthReqStorable.privateKey, publicKey: null };
    await this.anonymousHubService.createHubConnection(adminAuthReqStorable.id);
  }

  protected async startAuthRequestLogin(): Promise<void> {
    this.showResendNotification = false;

    try {
      let authRequestResponse: AuthRequestResponse;

      if (this.state === State.AdminAuthRequest) {
        await this.buildAuthRequest(AuthRequestType.AdminApproval);
        authRequestResponse = await this.apiService.postAdminAuthRequest(this.authRequest);

        const adminAuthReqStorable = new AdminAuthRequestStorable({
          id: authRequestResponse.id,
          privateKey: this.authRequestKeyPair.privateKey,
        });

        const userId = (await firstValueFrom(this.accountService.activeAccount$)).id;
        await this.authRequestService.setAdminAuthRequest(adminAuthReqStorable, userId);
      } else {
        await this.buildAuthRequest(AuthRequestType.AuthenticateAndUnlock);
        authRequestResponse = await this.apiService.postAuthRequest(this.authRequest);
      }

      if (authRequestResponse.id) {
        await this.anonymousHubService.createHubConnection(authRequestResponse.id);
      }
    } catch (e) {
      this.logService.error(e);
    }

    setTimeout(() => {
      this.showResendNotification = true;
    }, this.showResendNotificationTimeoutSeconds * 1000);
  }

  private async verifyAndHandleApprovedAuthReq(requestId: string): Promise<void> {
    try {
      // Retrieve the auth request from server and verify it's approved
      let authRequestResponse: AuthRequestResponse;

      if (this.state === State.AdminAuthRequest) {
        // Authed - no access code required
        authRequestResponse = await this.apiService.getAuthRequest(requestId);
      } else {
        // Unauthed - access code required for user verification
        authRequestResponse = await this.apiService.getAuthResponse(
          requestId,
          this.authRequest.accessCode,
        );
      }

      if (!authRequestResponse.requestApproved) {
        return;
      }

      // Approved so proceed:

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
      if (this.authStatus === AuthenticationStatus.Locked) {
        const userId = (await firstValueFrom(this.accountService.activeAccount$)).id;

        return await this.handleApprovedAdminAuthRequest(
          authRequestResponse,
          this.authRequestKeyPair.privateKey,
          userId,
        );
      }

      // Flow 1 and 4:

      // Note: credentials change based on if the authRequestResponse.key is a encryptedMasterKey or UserKey
      const credentials = await this.buildAuthRequestLoginCredentials(
        requestId,
        authRequestResponse,
      );

      // Note: keys are set by AuthRequestLoginStrategy success handling
      const authResult = await this.loginStrategyService.logIn(credentials);

      await this.handlePostLoginNavigation(authResult);
    } catch (error) {
      if (error instanceof ErrorResponse) {
        await this.router.navigate([this.backToRoute]);
        this.validationService.showError(error);
        return;
      }

      this.logService.error(error);
    }
  }

  private async handleApprovedAdminAuthRequest(
    adminAuthReqResponse: AuthRequestResponse,
    privateKey: ArrayBuffer,
    userId: UserId,
  ): Promise<void> {
    // See verifyAndHandleApprovedAuthReq(...) for flow details
    // it's flow 2 or 3 based on presence of masterPasswordHash
    if (adminAuthReqResponse.masterPasswordHash) {
      // Flow 2: masterPasswordHash is not null
      // key is authRequestPublicKey(masterKey) + we have authRequestPublicKey(masterPasswordHash)
      await this.authRequestService.setKeysAfterDecryptingSharedMasterKeyAndHash(
        adminAuthReqResponse,
        privateKey,
        userId,
      );
    } else {
      // Flow 3: masterPasswordHash is null
      // we can assume key is authRequestPublicKey(userKey) and we can just decrypt with userKey and proceed to vault
      await this.authRequestService.setUserKeyAfterDecryptingSharedUserKey(
        adminAuthReqResponse,
        privateKey,
        userId,
      );
    }

    // clear the admin auth request from state so it cannot be used again (it's a one time use)
    // TODO: this should eventually be enforced via deleting this on the server once it is used
    await this.authRequestService.clearAdminAuthRequest(userId);

    this.toastService.showToast({
      variant: "success",
      title: null,
      message: this.i18nService.t("loginApproved"),
    });

    // Now that we have a decrypted user key in memory, we can check if we
    // need to establish trust on the current device
    const activeAccount = await firstValueFrom(this.accountService.activeAccount$);
    await this.deviceTrustService.trustDeviceIfRequired(activeAccount.id);

    // TODO: don't forget to use auto enrollment service everywhere we trust device

    await this.handleSuccessfulLoginNavigation();
  }

  private async handlePostLoginNavigation(loginResponse: AuthResult) {
    if (loginResponse.requiresTwoFactor) {
      await this.router.navigate(["2fa"]);
    } else if (loginResponse.forcePasswordReset != ForceSetPasswordReason.None) {
      await this.router.navigate(["update-temp-password"]);
    } else {
      await this.handleSuccessfulLoginNavigation();
    }
  }

  private async buildAuthRequestLoginCredentials(
    requestId: string,
    authRequestResponse: AuthRequestResponse,
  ): Promise<AuthRequestLoginCredentials> {
    // if masterPasswordHash has a value, we will always receive key as authRequestPublicKey(masterKey) + authRequestPublicKey(masterPasswordHash)
    // if masterPasswordHash is null, we will always receive key as authRequestPublicKey(userKey)
    if (authRequestResponse.masterPasswordHash) {
      const { masterKey, masterKeyHash } =
        await this.authRequestService.decryptPubKeyEncryptedMasterKeyAndHash(
          authRequestResponse.key,
          authRequestResponse.masterPasswordHash,
          this.authRequestKeyPair.privateKey,
        );

      return new AuthRequestLoginCredentials(
        this.email,
        this.authRequest.accessCode,
        requestId,
        null, // no userKey
        masterKey,
        masterKeyHash,
      );
    } else {
      const userKey = await this.authRequestService.decryptPubKeyEncryptedUserKey(
        authRequestResponse.key,
        this.authRequestKeyPair.privateKey,
      );
      return new AuthRequestLoginCredentials(
        this.email,
        this.authRequest.accessCode,
        requestId,
        userKey,
        null, // no masterKey
        null, // no masterKeyHash
      );
    }
  }

  private async buildAuthRequest(authRequestType: AuthRequestType): Promise<void> {
    const authRequestKeyPairArray = await this.cryptoFunctionService.rsaGenerateKeyPair(2048);

    this.authRequestKeyPair = {
      publicKey: authRequestKeyPairArray[0],
      privateKey: authRequestKeyPairArray[1],
    };

    const deviceIdentifier = await this.appIdService.getAppId();
    const publicKey = Utils.fromBufferToB64(this.authRequestKeyPair.publicKey);
    const accessCode = await this.passwordGenerationService.generatePassword({
      type: "password",
      length: 25,
    });

    this.fingerprintPhrase = await this.authRequestService.getFingerprintPhrase(
      this.email,
      this.authRequestKeyPair.publicKey,
    );

    this.authRequest = new AuthRequest(
      this.email,
      deviceIdentifier,
      publicKey,
      authRequestType,
      accessCode,
    );
  }

  private async handleExistingAdminAuthReqDeletedOrDenied(userId: UserId) {
    // clear the admin auth request from state
    await this.authRequestService.clearAdminAuthRequest(userId);

    // start new auth request
    await this.startAuthRequestLogin();
  }

  private async handleSuccessfulLoginNavigation() {
    if (this.state === State.StandardAuthRequest) {
      // Only need to set remembered email on standard login with auth req flow
      await this.loginEmailService.saveEmailSettings();
    }

    // TODO-rr-bw: Verify if we want to await a fullSync on all clients now (not just Extension/Desktop as before)
    await this.syncService.fullSync(true);
    await this.router.navigate(["vault"]);
  }
}
