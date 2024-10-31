import { CommonModule } from "@angular/common";
import { Component, DestroyRef, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormBuilder, FormControl, ReactiveFormsModule } from "@angular/forms";
import { Router } from "@angular/router";
import { defer, firstValueFrom, map, switchMap } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { DeviceTrustServiceAbstraction } from "@bitwarden/common/auth/abstractions/device-trust.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { UserId } from "@bitwarden/common/types/guid";
import {
  AsyncActionsModule,
  ButtonModule,
  CheckboxModule,
  FormFieldModule,
  ToastService,
} from "@bitwarden/components";

@Component({
  standalone: true,
  templateUrl: "./login-decryption-options.component.html",
  imports: [
    AsyncActionsModule,
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

  loading = false;

  // Remember device means for the user to trust the device
  formGroup = this.formBuilder.group({
    rememberDevice: [false], // TODO-rr-bw: change to true by default after testing
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
    private router: Router,
    private toastService: ToastService,
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

  submit = () => {};
}
