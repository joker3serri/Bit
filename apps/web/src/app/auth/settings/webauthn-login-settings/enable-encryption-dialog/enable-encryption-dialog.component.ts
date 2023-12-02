import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { Subject } from "rxjs";
import { takeUntil } from "rxjs/operators";

import { WebAuthnLoginServiceAbstraction } from "@bitwarden/common/auth/abstractions/webauthn/webauthn-login.service.abstraction";
import { WebAuthnLoginCredentialAssertionOptionsView } from "@bitwarden/common/auth/models/view/webauthn-login/webauthn-login-credential-assertion-options.view";
import { Verification } from "@bitwarden/common/auth/types/verification";
import { ErrorResponse } from "@bitwarden/common/models/response/error.response";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { DialogService } from "@bitwarden/components/src/dialog/dialog.service";

import { WebauthnLoginAdminService } from "../../../core/services/webauthn-login/webauthn-login-admin.service";
import { PendingWebauthnLoginCredentialView } from "../../../core/views/pending-webauthn-login-credential.view";
import { WebauthnLoginCredentialView } from "../../../core/views/webauthn-login-credential.view";

export interface EnableEncryptionDialogParams {
  credentialId: string;
}

@Component({
  templateUrl: "enable-encryption-dialog.component.html",
})
export class EnableEncryptionDialogComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  protected invalidSecret = false;
  protected formGroup = this.formBuilder.group({
    userVerification: this.formBuilder.group({
      secret: [null as Verification | null, Validators.required],
    }),
  });

  protected credential?: WebauthnLoginCredentialView;
  protected credentialOptions?: WebAuthnLoginCredentialAssertionOptionsView;
  protected pendingCredential?: PendingWebauthnLoginCredentialView;
  protected loading$ = this.webauthnService.loading$;

  constructor(
    @Inject(DIALOG_DATA) private params: EnableEncryptionDialogParams,
    private formBuilder: FormBuilder,
    private dialogRef: DialogRef,
    private webauthnService: WebauthnLoginAdminService,
    private webauthnLoginService: WebAuthnLoginServiceAbstraction,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private logService: LogService
  ) {}

  ngOnInit(): void {
    this.webauthnService
      .getCredential$(this.params.credentialId)
      .pipe(takeUntil(this.destroy$))
      .subscribe((credential: any) => (this.credential = credential));
  }

  submit = async () => {
    if (this.credential === undefined) {
      return;
    }

    this.dialogRef.disableClose = true;
    try {
      this.credentialOptions = await this.webauthnService.getCredentialAssertOptions(
        this.formGroup.value.userVerification.secret
      );
      await this.webauthnService.enableCredentialEncryption(
        await this.webauthnLoginService.assertCredential(this.credentialOptions)
      );
    } catch (error) {
      if (error instanceof ErrorResponse && error.statusCode === 400) {
        this.invalidSecret = true;
      } else {
        this.logService?.error(error);
        this.platformUtilsService.showToast(
          "error",
          this.i18nService.t("unexpectedError"),
          error.message
        );
      }
      return;
    }

    this.dialogRef.close();
  };

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  protected async submitCredentialCreation() {
    // this.pendingCredential = await this.webauthnService.createKeySet(this.credentialOptions);
    if (this.pendingCredential === undefined) {
      return;
    }
  }
}

/**
 * Strongly typed helper to open a DeleteCredentialDialogComponent
 * @param dialogService Instance of the dialog service that will be used to open the dialog
 * @param config Configuration for the dialog
 */
export const openEnableCredentialDialogComponent = (
  dialogService: DialogService,
  config: DialogConfig<EnableEncryptionDialogParams>
) => {
  return dialogService.open<unknown>(EnableEncryptionDialogComponent, config);
};
