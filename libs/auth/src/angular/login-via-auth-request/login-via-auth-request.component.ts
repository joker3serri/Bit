import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { IsActiveMatchOptions, Router, RouterModule } from "@angular/router";
import { firstValueFrom, map, Subject, takeUntil } from "rxjs";

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
import { CreateAuthRequest } from "@bitwarden/common/auth/models/request/create-auth.request";
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
  StandardAuthRequest,
  AdminAuthRequest,
}

@Component({
  standalone: true,
  templateUrl: "./login-via-auth-request.component.html",
  imports: [ButtonModule, CommonModule, JslibModule, LinkModule, RouterModule],
})
export class LoginViaAuthRequestComponent implements OnInit, OnDestroy {
  private authRequest: CreateAuthRequest;
  private authRequestKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array };
  private authStatus: AuthenticationStatus;
  private destroy$ = new Subject<void>();
  private resendTimeoutSeconds = 12;

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
      .pipe(takeUntil(this.destroy$))
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
    this.email = await firstValueFrom(this.loginEmailService.loginEmail$);
    this.authStatus = await firstValueFrom(this.authService.activeAccountStatus$);

    const matchOptions: IsActiveMatchOptions = {
      paths: "exact",
      queryParams: "ignored",
      fragment: "ignored",
      matrixParams: "ignored",
    };

    if (this.router.isActive("admin-approval-requested", matchOptions)) {
      this.state = State.AdminAuthRequest;
    }

    if (this.state === State.AdminAuthRequest) {
      // Get email from state for admin auth requests because it is available.
      // TODO-rr-bw: Verify if the comment below is still true
      // This also prevents it from being lost on refresh as the login service email does not persist.
      this.email = await firstValueFrom(
        this.accountService.activeAccount$.pipe(map((a) => a?.email)),
      );
      const userId = (await firstValueFrom(this.accountService.activeAccount$)).id;

      if (!this.email) {
        this.toastService.showToast({
          variant: "error",
          title: null,
          message: this.i18nService.t("userEmailMissing"),
        });

        await this.router.navigate(["/login-initiated"]);
        return;
      }

      // We only allow a single admin approval request to be active at a time
      // so we must check state to see if we have an existing one or not
      const adminAuthReqStorable = await this.authRequestService.getAdminAuthRequest(userId);

      if (adminAuthReqStorable) {
        await this.handleExistingAdminAuthRequest(adminAuthReqStorable, userId);
      } else {
        // No existing admin auth request; so we need to create one
        await this.startAuthRequestLogin();
      }
    } else {
      // Standard auth request
      // TODO: evaluate if we can remove the setting of this.email in the constructor
      this.email = await firstValueFrom(this.loginEmailService.loginEmail$);

      if (!this.email) {
        this.toastService.showToast({
          variant: "error",
          title: null,
          message: this.i18nService.t("userEmailMissing"),
        });

        await this.router.navigate(["/login"]);
        return;
      }

      await this.startAuthRequestLogin();
    }
  }

  async ngOnDestroy(): Promise<void> {
    await this.anonymousHubService.stopHubConnection();

    this.destroy$.next();
    this.destroy$.complete();
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
      let reqResponse: AuthRequestResponse;

      if (this.state === State.AdminAuthRequest) {
        await this.buildAuthRequest(AuthRequestType.AdminApproval);
        reqResponse = await this.apiService.postAdminAuthRequest(this.authRequest);

        const adminAuthReqStorable = new AdminAuthRequestStorable({
          id: reqResponse.id,
          privateKey: this.authRequestKeyPair.privateKey,
        });

        const userId = (await firstValueFrom(this.accountService.activeAccount$)).id;
        await this.authRequestService.setAdminAuthRequest(adminAuthReqStorable, userId);
      } else {
        await this.buildAuthRequest(AuthRequestType.AuthenticateAndUnlock);
        reqResponse = await this.apiService.postAuthRequest(this.authRequest);
      }

      if (reqResponse.id) {
        await this.anonymousHubService.createHubConnection(reqResponse.id);
      }
    } catch (e) {
      this.logService.error(e);
    }

    setTimeout(() => {
      this.showResendNotification = true;
    }, this.resendTimeoutSeconds * 1000);
  }

  private async verifyAndHandleApprovedAuthReq(requestId: string): Promise<void> {
    try {
      // Retrieve the auth request from server and verify it's approved
      let authReqResponse: AuthRequestResponse;

      switch (this.state) {
        case State.StandardAuthRequest:
          // Unauthed - access code required for user verification
          authReqResponse = await this.apiService.getAuthResponse(
            requestId,
            this.authRequest.accessCode,
          );
          break;

        case State.AdminAuthRequest:
          // Authed - no access code required
          authReqResponse = await this.apiService.getAuthRequest(requestId);
          break;

        default:
          break;
      }

      if (!authReqResponse.requestApproved) {
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
          authReqResponse,
          this.authRequestKeyPair.privateKey,
          userId,
        );
      }

      // Flow 1 and 4:
      const loginAuthResult = await this.loginViaAuthRequestStrategy(requestId, authReqResponse);
      await this.handlePostLoginNavigation(loginAuthResult);
    } catch (error) {
      if (error instanceof ErrorResponse) {
        let errorRoute = "/login";
        if (this.state === State.AdminAuthRequest) {
          errorRoute = "/login-initiated";
        }

        // FIXME: Verify that this floating promise is intentional. If it is, add an explanatory comment and ensure there is proper error handling.
        // eslint-disable-next-line @typescript-eslint/no-floating-promises
        this.router.navigate([errorRoute]);
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

  private async loginViaAuthRequestStrategy(
    requestId: string,
    authReqResponse: AuthRequestResponse,
  ): Promise<AuthResult> {
    // Note: credentials change based on if the authReqResponse.key is a encryptedMasterKey or UserKey
    const credentials = await this.buildAuthRequestLoginCredentials(requestId, authReqResponse);

    // Note: keys are set by AuthRequestLoginStrategy success handling
    return await this.loginStrategyService.logIn(credentials);
  }

  // Routing logic
  private async handlePostLoginNavigation(loginResponse: AuthResult) {
    if (loginResponse.requiresTwoFactor) {
      await this.router.navigate(["2fa"]);
    } else if (loginResponse.forcePasswordReset != ForceSetPasswordReason.None) {
      await this.router.navigate(["update-temp-password"]);
    } else {
      await this.handleSuccessfulLoginNavigation();
    }
  }

  // Authentication helper
  private async buildAuthRequestLoginCredentials(
    requestId: string,
    response: AuthRequestResponse,
  ): Promise<AuthRequestLoginCredentials> {
    // if masterPasswordHash has a value, we will always receive key as authRequestPublicKey(masterKey) + authRequestPublicKey(masterPasswordHash)
    // if masterPasswordHash is null, we will always receive key as authRequestPublicKey(userKey)
    if (response.masterPasswordHash) {
      const { masterKey, masterKeyHash } =
        await this.authRequestService.decryptPubKeyEncryptedMasterKeyAndHash(
          response.key,
          response.masterPasswordHash,
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
        response.key,
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

    this.authRequest = new CreateAuthRequest(
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
