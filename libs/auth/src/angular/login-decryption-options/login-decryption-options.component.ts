import { CommonModule } from "@angular/common";
import { Component, DestroyRef, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, FormControl, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { defer, firstValueFrom, map, switchMap } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  LoginEmailServiceAbstraction,
  UserDecryptionOptions,
  UserDecryptionOptionsServiceAbstraction,
} from "@bitwarden/auth/common";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { DeviceTrustServiceAbstraction } from "@bitwarden/common/auth/abstractions/device-trust.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { ValidationService } from "@bitwarden/common/platform/abstractions/validation.service";
import { UserId } from "@bitwarden/common/types/guid";
import { ButtonModule, CheckboxModule, FormFieldModule, ToastService } from "@bitwarden/components";

enum State {
  NewUser,
  ExistingUserUntrustedDevice,
}

type NewUserData = {
  readonly state: State.NewUser;
  readonly organizationId: string;
  readonly userEmail: string;
};

type ExistingUserUntrustedDeviceData = {
  readonly state: State.ExistingUserUntrustedDevice;
  readonly showApproveFromOtherDeviceBtn: boolean;
  readonly showReqAdminApprovalBtn: boolean;
  readonly showApproveWithMasterPasswordBtn: boolean;
  readonly userEmail: string;
};

type Data = NewUserData | ExistingUserUntrustedDeviceData;

@Component({
  standalone: true,
  templateUrl: "./login-decryption-options.component.html",
  imports: [
    ButtonModule,
    CheckboxModule,
    CommonModule,
    FormFieldModule,
    JslibModule,
    ReactiveFormsModule,
  ],
})
export class LoginDecryptionOptionsComponent implements OnInit {
  private activeAccountId: UserId;
  private email: string;

  protected data?: Data;
  protected loading = false;
  protected State = State;

  protected formGroup = this.formBuilder.group({
    // TODO-rr-bw: change to true by default after testing
    rememberDevice: [false], // Remember device means for the user to trust the device
  });

  get rememberDeviceControl(): FormControl<boolean> {
    return this.formGroup.controls.rememberDevice;
  }

  constructor(
    private accountService: AccountService,
    private destroyRef: DestroyRef,
    private deviceTrustService: DeviceTrustServiceAbstraction,
    private formBuilder: FormBuilder,
    private i18nService: I18nService,
    private loginEmailService: LoginEmailServiceAbstraction,
    private router: Router,
    private toastService: ToastService,
    private userDecryptionOptionsService: UserDecryptionOptionsServiceAbstraction,
    private validationService: ValidationService,
  ) {}

  async ngOnInit(): Promise<void> {
    // this.loading = true; // TODO-rr-bw: uncomment after testing

    this.activeAccountId = (await firstValueFrom(this.accountService.activeAccount$))?.id;

    this.email = await firstValueFrom(
      this.accountService.activeAccount$.pipe(map((a) => a?.email)),
    );

    if (!this.email) {
      this.toastService.showToast({
        variant: "error",
        title: null,
        message: this.i18nService.t("userEmailMissing"),
      });

      await this.router.navigate(["/login"]);
      return;
    }

    this.observeAndPersistRememberDeviceValueChanges();

    // Persist user choice from state if it exists
    await this.setRememberDeviceDefaultValue();

    try {
      const userDecryptionOptions = await firstValueFrom(
        this.userDecryptionOptionsService.userDecryptionOptions$,
      );

      if (
        !userDecryptionOptions?.trustedDeviceOption?.hasAdminApproval &&
        !userDecryptionOptions?.hasMasterPassword
      ) {
        // this.loadNewUserData();
      } else {
        this.loadUntrustedDeviceData(userDecryptionOptions);
      }
    } catch (err) {
      this.validationService.showError(err);
    }
  }

  private observeAndPersistRememberDeviceValueChanges(): void {
    this.rememberDeviceControl.valueChanges
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((value) =>
          defer(() => this.deviceTrustService.setShouldTrustDevice(this.activeAccountId, value)),
        ),
      )
      .subscribe();
  }

  private async setRememberDeviceDefaultValue() {
    const rememberDeviceFromState = await this.deviceTrustService.getShouldTrustDevice(
      this.activeAccountId,
    );

    const rememberDevice = rememberDeviceFromState ?? true;

    this.rememberDeviceControl.setValue(rememberDevice);
  }

  private loadUntrustedDeviceData(userDecryptionOptions: UserDecryptionOptions) {
    const showApproveFromOtherDeviceBtn =
      userDecryptionOptions?.trustedDeviceOption?.hasLoginApprovingDevice || false;

    const showReqAdminApprovalBtn =
      !!userDecryptionOptions?.trustedDeviceOption?.hasAdminApproval || false;

    const showApproveWithMasterPasswordBtn = userDecryptionOptions?.hasMasterPassword || false;

    this.data = {
      state: State.ExistingUserUntrustedDevice,
      showApproveFromOtherDeviceBtn,
      showReqAdminApprovalBtn,
      showApproveWithMasterPasswordBtn,
      userEmail: this.email,
    };
  }

  protected async approveFromOtherDevice() {
    if (this.data.state !== State.ExistingUserUntrustedDevice) {
      return;
    }

    this.loginEmailService.setLoginEmail(this.data.userEmail);
    await this.router.navigate(["/login-with-device"]);
  }

  protected async approveWithMasterPassword() {
    await this.router.navigate(["/lock"], {
      queryParams: {
        from: "login-initiated",
      },
    });
  }

  protected async requestAdminApproval() {
    this.loginEmailService.setLoginEmail(this.data.userEmail);
    await this.router.navigate(["/admin-approval-requested"]);
  }
}
