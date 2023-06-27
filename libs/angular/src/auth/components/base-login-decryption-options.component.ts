import { Directive, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { firstValueFrom, from, map, of, Subject, switchMap } from "rxjs";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { DeviceCryptoServiceAbstraction } from "@bitwarden/common/abstractions/device-crypto.service.abstraction";
import { DevicesApiServiceAbstraction } from "@bitwarden/common/abstractions/devices/devices-api.service.abstraction";
import { OrganizationUserService } from "@bitwarden/common/abstractions/organization-user/organization-user.service";
import { OrganizationUserResetPasswordEnrollmentRequest } from "@bitwarden/common/abstractions/organization-user/requests";
import { OrganizationApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/organization/organization-api.service.abstraction";
import { LoginService } from "@bitwarden/common/auth/abstractions/login.service";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { DeviceType } from "@bitwarden/common/enums/device-type.enum";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { AccountDecryptionOptions } from "@bitwarden/common/platform/models/domain/account";

import { KeysRequest } from "../../../../common/src/models/request/keys.request";

// TODO: replace this base component with a service per latest ADR
@Directive()
export class BaseLoginDecryptionOptionsComponent implements OnInit, OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject();

  userEmail?: string;
  organizationId?: string;

  rememberDeviceForm = this.formBuilder.group({
    rememberDevice: [true],
  });

  loading = true;

  approvalRequired = false;
  showApproveFromOtherDeviceBtn = false;
  showReqAdminApprovalBtn = false;
  showApproveWithMasterPasswordBtn = false;

  constructor(
    protected formBuilder: FormBuilder,
    protected devicesApiService: DevicesApiServiceAbstraction,
    protected stateService: StateService,
    protected router: Router,
    protected activatedRoute: ActivatedRoute,
    protected messagingService: MessagingService,
    protected tokenService: TokenService,
    protected loginService: LoginService,
    protected organizationApiService: OrganizationApiServiceAbstraction,
    protected cryptoService: CryptoService,
    protected deviceCryptoService: DeviceCryptoServiceAbstraction,
    protected organizationUserService: OrganizationUserService,
    protected apiService: ApiService,
    protected i18nService: I18nService
  ) {}

  async ngOnInit() {
    // Get user's email from access token:
    this.userEmail = await this.tokenService.getEmail();
    const autoEnrollStatus$ = this.activatedRoute.queryParamMap.pipe(
      map((params) => params.get("identifier")),
      switchMap((identifier) => {
        if (identifier == null) {
          return of(null);
        }

        return from(this.organizationApiService.getAutoEnrollStatus(identifier));
      })
    );
    const autoEnrollStatus = await firstValueFrom(autoEnrollStatus$);
    this.organizationId = autoEnrollStatus.id;

    const devicesListResponse = await this.devicesApiService.getDevices();
    const acctDecryptionOptions: AccountDecryptionOptions =
      await this.stateService.getAcctDecryptionOptions();

    // If the user does not have admin approval set up then we are dealing with a new account
    this.approvalRequired = acctDecryptionOptions?.trustedDeviceOption?.hasAdminApproval;

    // Determine if the user has any mobile or desktop devices
    // to determine if we should show the approve from other device button
    for (const device of devicesListResponse.data) {
      if (
        device.type === DeviceType.Android ||
        device.type === DeviceType.iOS ||
        device.type === DeviceType.AndroidAmazon ||
        device.type === DeviceType.WindowsDesktop ||
        device.type === DeviceType.MacOsDesktop ||
        device.type === DeviceType.LinuxDesktop ||
        device.type === DeviceType.UWP
      ) {
        this.showApproveFromOtherDeviceBtn = true;
        break;
      }
    }
    // Show the admin approval btn if user has TDE enabled and the org admin approval policy is set && user email is not null
    this.showReqAdminApprovalBtn =
      !!acctDecryptionOptions.trustedDeviceOption?.hasAdminApproval && this.userEmail != null;

    this.showApproveWithMasterPasswordBtn = acctDecryptionOptions.hasMasterPassword;

    // TODO: do I extend the lock guard for the lock screen to prevent the user from getting to the lock screen
    // if they do not have a master password set

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

  autoEnroll = async () => {
    // this.loading to support clients without CL-support
    this.loading = true;
    try {
      const { userKey, publicKey, privateKey } = await this.cryptoService.initAccount();
      const keysRequest = new KeysRequest(publicKey, privateKey.encryptedString);
      await this.apiService.postAccountKeys(keysRequest);

      const orgKeyResponse = await this.organizationApiService.getKeys(this.organizationId);
      if (orgKeyResponse == null) {
        throw new Error(this.i18nService.t("resetPasswordOrgKeysError"));
      }

      const orgPublicKey = Utils.fromB64ToArray(orgKeyResponse.publicKey);

      // RSA Encrypt user's userKey.key with organization public key
      const userId = await this.stateService.getUserId();
      const encryptedKey = await this.cryptoService.rsaEncrypt(userKey.key, orgPublicKey.buffer);

      const resetRequest = new OrganizationUserResetPasswordEnrollmentRequest();
      resetRequest.resetPasswordKey = encryptedKey.encryptedString;

      await this.organizationUserService.putOrganizationUserResetPasswordEnrollment(
        this.organizationId,
        userId,
        resetRequest
      );

      if (this.rememberDeviceForm.value.rememberDevice) {
        await this.deviceCryptoService.trustDevice();
      }

      // TODO: On browser this should close the window. But since we might extract
      // this logic into a service I'm gonna leaves this as-is untill that
      // refactor is done
      await this.router.navigate(["/vault"]);
    } finally {
      this.loading = false;
    }
  };

  logOut() {
    this.loading = true; // to avoid an awkward delay in browser extension
    this.messagingService.send("logout");
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
