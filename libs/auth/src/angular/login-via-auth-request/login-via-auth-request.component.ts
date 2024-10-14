import { Component, OnDestroy, OnInit } from "@angular/core";
import { IsActiveMatchOptions, Router } from "@angular/router";
import { firstValueFrom, map, Subject, takeUntil } from "rxjs";

import {
  AuthRequestServiceAbstraction,
  LoginEmailServiceAbstraction,
} from "@bitwarden/auth/common";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import { AdminAuthRequestStorable } from "@bitwarden/common/auth/models/domain/admin-auth-req-storable";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
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
  private authStatus: AuthenticationStatus;
  private destroy$ = new Subject<void>();

  protected email: string;
  protected StateEnum = State;
  protected state = State.StandardAuthRequest;

  constructor(
    private accountService: AccountService,
    private authRequestService: AuthRequestServiceAbstraction,
    private authService: AuthService,
    private i18nService: I18nService,
    private logService: LogService,
    private loginEmailService: LoginEmailServiceAbstraction,
    private router: Router,
    private toastService: ToastService,
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
    // code...
  }
}
