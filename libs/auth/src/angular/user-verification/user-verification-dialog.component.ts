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

import { ButtonType } from "../../../../components/src/shared/button-like.abstraction";

import { ActiveClientVerificationOption } from "./active-client-verification-option.enum";
import { UserVerificationFormInputComponent } from "./user-verification-form-input.component";

/**
 * Options for configuring the callout to be displayed in the dialog body below the
 * optional body text.
 * @param {string} text - The text of the callout.
 * @param {string} type - The type of the callout.
 */
export type UserVerificationCalloutOptions = {
  text: string;
  type: "warning" | "danger" | "error" | "tip";
};

export type UserVerificationConfirmButtonOptions = {
  text: string;
  type: ButtonType;
};

/**
 * Parameters for configuring the user verification dialog.
 * @param {string} [title] - The title of the dialog. Optional. Defaults to "Verification required"
 * @param {string} [bodyText] - The body text of the dialog. Optional.
 * @param {UserVerificationCalloutOptions} [calloutOptions] - The options for a callout to be displayed in the dialog body below the body text. Optional.
 * @param {UserVerificationConfirmButtonOptions} [confirmButtonOptions] - The options for the confirm button. Optional. The default text is "Submit" and the default type is "primary".
 * @param {boolean} [clientSideOnlyVerification] - Indicates whether the verification is only performed client-side. Optional.
 */
export type UserVerificationDialogParams = {
  title?: string;
  bodyText?: string;
  calloutOptions?: UserVerificationCalloutOptions;
  confirmButtonOptions?: UserVerificationConfirmButtonOptions;
  clientSideOnlyVerification?: boolean;
};

export type UserVerificationDialogResult = {
  userAction: "confirm" | "cancel";
  verificationSuccess: boolean;
  noAvailableClientVerificationMethods?: boolean;
};

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
