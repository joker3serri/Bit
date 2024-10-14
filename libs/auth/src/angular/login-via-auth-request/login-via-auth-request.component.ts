import { Component, OnDestroy, OnInit } from "@angular/core";
import { IsActiveMatchOptions, Router } from "@angular/router";
import { firstValueFrom, map, Subject, takeUntil } from "rxjs";

import {
  AuthRequestLoginCredentials,
  AuthRequestServiceAbstraction,
  LoginEmailServiceAbstraction,
  LoginStrategyServiceAbstraction,
} from "@bitwarden/auth/common";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { AdminAuthRequestStorable } from "@bitwarden/common/auth/models/domain/admin-auth-req-storable";
import { AuthResult } from "@bitwarden/common/auth/models/domain/auth-result";
import { CreateAuthRequest } from "@bitwarden/common/auth/models/request/create-auth.request";
import { AuthRequestResponse } from "@bitwarden/common/auth/models/response/auth-request.response";
import { ErrorResponse } from "@bitwarden/common/models/response/error.response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";
import { UserId } from "@bitwarden/common/types/guid";
import { ToastService } from "@bitwarden/components";

enum State {
  StandardAuthRequest,
  AdminAuthRequest,
}

@Component({
  standalone: true,
  templateUrl: "./login-via-auth-request.component.html",
  imports: [],
})
export class LoginViaAuthRequestComponent implements OnInit, OnDestroy {
  private authRequest: CreateAuthRequest;
  private authRequestKeyPair: { publicKey: Uint8Array; privateKey: Uint8Array };
  private authStatus: AuthenticationStatus;
  private destroy$ = new Subject<void>();

  protected email: string;
  protected StateEnum = State;
  protected state = State.StandardAuthRequest;

  constructor(
    private accountService: AccountService,
    private apiService: ApiService,
    private authRequestService: AuthRequestServiceAbstraction,
    private authService: AuthService,
    private i18nService: I18nService,
    private logService: LogService,
    private loginEmailService: LoginEmailServiceAbstraction,
    private loginStrategyService: LoginStrategyServiceAbstraction,
    private router: Router,
    private toastService: ToastService,
    private validationService: ValidationService,
  ) {
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
    this.authStatus = await this.authService.getAuthStatus();

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
      // Pull email from state for admin auth reqs b/c it is available
      // This also prevents it from being lost on refresh as the
      // login service email does not persist.
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
      // so must check state to see if we have an existing one or not
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
    // await this.anonymousHubService.stopHubConnection();

    this.destroy$.next();
    this.destroy$.complete();
  }

  private async handleExistingAdminAuthRequest(
    adminAuthReqStorable: AdminAuthRequestStorable,
    userId: UserId,
  ): Promise<void> {
    // code...
  }

  private async startAuthRequestLogin(): Promise<void> {
    // code...
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
    // code...
  }

  // TODO-rr-bw: remove void return type
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
    // code...
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
}
