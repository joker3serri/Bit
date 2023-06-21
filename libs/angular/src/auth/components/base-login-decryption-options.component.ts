import { Directive, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { Router } from "@angular/router";
import {
  Observable,
  Subject,
  catchError,
  combineLatest,
  from,
  map,
  takeUntil,
  tap,
  throwError,
} from "rxjs";

import { DevicesApiServiceAbstraction } from "@bitwarden/common/abstractions/devices/devices-api.service.abstraction";
import { DeviceResponse } from "@bitwarden/common/abstractions/devices/responses/device.response";
import { LoginService } from "@bitwarden/common/auth/abstractions/login.service";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { DesktopDeviceTypes, MobileDeviceTypes } from "@bitwarden/common/enums/device-type.enum";
import { ListResponse } from "@bitwarden/common/models/response/list.response";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { AccountDecryptionOptions } from "@bitwarden/common/platform/models/domain/account";

// TODO: replace this base component with a service per latest ADR
@Directive()
export class BaseLoginDecryptionOptionsComponent implements OnInit, OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject();

  showApproveFromOtherDeviceBtn$: Observable<boolean>;
  showReqAdminApprovalBtn$: Observable<boolean>;
  showApproveWithMasterPasswordBtn$: Observable<boolean>;
  userEmail$: Observable<string>;
  userEmail: string = null;

  rememberDeviceForm = this.formBuilder.group({
    rememberDevice: [true],
  });

  loading = true;

  constructor(
    protected formBuilder: FormBuilder,
    protected devicesApiService: DevicesApiServiceAbstraction,
    protected stateService: StateService,
    protected router: Router,
    protected messagingService: MessagingService,
    protected tokenService: TokenService,
    protected loginService: LoginService
  ) {}

  ngOnInit() {
    const devices$: Observable<ListResponse<DeviceResponse>> = from(
      this.devicesApiService.getDevices()
    );
    const accountDecryptionOptions$: Observable<AccountDecryptionOptions> = from(
      this.stateService.getAccountDecryptionOptions()
    );
    // Pull user email from access token b/c it's available post authN
    this.userEmail$ = from(this.tokenService.getEmail()).pipe(
      tap((email) => (this.userEmail = email)), // set userEmail as a side effect
      catchError((err: unknown) => {
        // TODO: figure out correct error handling
        return throwError(() => err);
      }),
      takeUntil(this.componentDestroyed$)
    );

    this.loading = true;

    // Show approve from other device btn if user has any mobile or desktop devices
    this.showApproveFromOtherDeviceBtn$ = devices$.pipe(
      catchError((err: unknown) => {
        // TODO: figure out correct error handling
        return throwError(() => err);
      }),

      map((response) =>
        response.data.some(
          (device) => MobileDeviceTypes.has(device.type) || DesktopDeviceTypes.has(device.type)
        )
      ),
      takeUntil(this.componentDestroyed$)
    );

    // Show the admin approval btn if user has TDE enabled and the org admin approval policy is set && user email is not null
    this.showReqAdminApprovalBtn$ = combineLatest([
      accountDecryptionOptions$,
      this.userEmail$,
    ]).pipe(
      catchError((err: unknown) => {
        // TODO: figure out correct error handling
        return throwError(() => err);
      }),
      map(
        ([acctDecryptionOptions, userEmail]) =>
          !!acctDecryptionOptions.trustedDeviceOption?.hasAdminApproval && userEmail != null
      ),
      takeUntil(this.componentDestroyed$)
    );

    this.showApproveWithMasterPasswordBtn$ = accountDecryptionOptions$.pipe(
      catchError((err: unknown) => {
        // TODO: figure out correct error handling
        return throwError(() => err);
      }),
      map((acctDecryptionOptions) => acctDecryptionOptions.hasMasterPassword),
      takeUntil(this.componentDestroyed$)
    );

    this.loading = false;
  }

  approveFromOtherDevice() {
    // TODO: plan is to re-use existing login-with-device component but rework it to have two flows
    // (1) Standard flow for unauthN user based on AuthService status
    // (2) New flow for authN user based on AuthService status b/c they have just authenticated w/ SSO
    this.loginService.setEmail(this.userEmail);
    this.router.navigate(["/login-with-device"]);
  }

  requestAdminApproval() {
    // this.router.navigate(["/admin-approval-requested"]); // new component that doesn't exist yet
    // Idea: extract logic from the existing login-with-device component into a base-auth-request-component that
    // the new admin-approval-requested component and the existing login-with-device component can extend
    // TODO: how to do:
    // add create admin approval request on new OrganizationAuthRequestsController on the server
    // once https://github.com/bitwarden/server/pull/2993 is merged
    // Client will create an AuthRequest of type AdminAuthRequest WITHOUT orgId and send it to the server
    // Server will look up the org id(s) based on the user id and create the AdminAuthRequest(s)
    // Note: must lookup if the user has an account recovery key (resetPasswordKey) set in the org
    // (means they've opted into the Admin Acct Recovery feature)
    // Per discussion with Micah, fire out requests to all admins in any orgs the user is a member of
    // UNTIL the Admin Console team finishes their work to turn on Single Org policy when Admin Acct Recovery is enabled.
  }

  approveWithMasterPassword() {
    this.router.navigate(["/lock"]);
  }

  logOut() {
    this.loading = true; // to avoid an awkward delay in browser extension
    this.messagingService.send("logout");
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
