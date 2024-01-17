import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";
import { firstValueFrom } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { VerificationWithSecret } from "@bitwarden/common/auth/types/verification";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import {
  AsyncActionsModule,
  ButtonModule,
  DialogModule,
  DialogService,
} from "@bitwarden/components";

import { ActiveClientVerificationOption } from "./active-client-verification-option.enum";
import {
  UserVerificationDialogParams,
  UserVerificationDialogResult,
} from "./user-verification-dialog.types";
import { UserVerificationFormInputComponent } from "./user-verification-form-input.component";

@Component({
  templateUrl: "user-verification-dialog.component.html",
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JslibModule,
    ButtonModule,
    DialogModule,
    AsyncActionsModule,
    UserVerificationFormInputComponent,
  ],
})
export class UserVerificationDialogComponent {
  verificationForm = this.formBuilder.group({
    secret: this.formBuilder.control<VerificationWithSecret | null>(null),
  });

  get secret() {
    return this.verificationForm.controls.secret;
  }

  invalidSecret = false;
  activeClientVerificationOption: ActiveClientVerificationOption;
  ActiveClientVerificationOption = ActiveClientVerificationOption;

  constructor(
    @Inject(DIALOG_DATA) public dialogParams: UserVerificationDialogParams,
    private dialogRef: DialogRef<UserVerificationDialogResult | string>,
    private formBuilder: FormBuilder,
    private userVerificationService: UserVerificationService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
  ) {}

  static async open(
    dialogService: DialogService,
    data: UserVerificationDialogParams,
  ): Promise<UserVerificationDialogResult> {
    const dialogRef = dialogService.open<UserVerificationDialogResult | string>(
      UserVerificationDialogComponent,
      {
        data,
      },
    );

    const dialogResult = await firstValueFrom(dialogRef.closed);

    if (typeof dialogResult === "string") {
      // User used x to close dialog
      return {
        userAction: "cancel",
        verificationSuccess: false,
      };
    } else {
      return dialogResult;
    }
  }

  handleActiveClientVerificationOptionChange(
    activeClientVerificationOption: ActiveClientVerificationOption,
  ) {
    this.activeClientVerificationOption = activeClientVerificationOption;
  }

  handleBiometricsVerificationResultChange(biometricsVerificationResult: boolean) {
    if (biometricsVerificationResult) {
      this.close({
        userAction: "confirm",
        verificationSuccess: true,
        noAvailableClientVerificationMethods: false,
      });

      // TODO: evaluate how invalid secret should play into biometrics flows.
      // this.invalidSecret = false;
    }
  }

  submit = async () => {
    if (this.activeClientVerificationOption === ActiveClientVerificationOption.None) {
      this.close({
        userAction: "confirm",
        verificationSuccess: false,
        noAvailableClientVerificationMethods: true,
      });
      return;
    }

    this.verificationForm.markAllAsTouched();

    if (this.verificationForm.invalid) {
      return;
    }

    try {
      //Incorrect secret will throw an invalid password error.
      await this.userVerificationService.verifyUser(this.secret.value);
      this.invalidSecret = false;
    } catch (e) {
      this.invalidSecret = true;
      this.platformUtilsService.showToast("error", this.i18nService.t("error"), e.message);
      return;
    }

    this.close({
      userAction: "confirm",
      verificationSuccess: true,
      noAvailableClientVerificationMethods: false,
    });
  };

  cancel() {
    this.close({
      userAction: "cancel",
      verificationSuccess: false,
    });
  }

  close(dialogResult: UserVerificationDialogResult) {
    this.dialogRef.close(dialogResult);
  }
}
