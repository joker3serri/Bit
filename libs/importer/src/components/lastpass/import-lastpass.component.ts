import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import {
  AsyncValidatorFn,
  ControlContainer,
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";
import { firstValueFrom, map } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import {
  CalloutModule,
  CheckboxModule,
  DialogService,
  FormFieldModule,
  IconButtonModule,
  TypographyModule,
} from "@bitwarden/components";

import { LastPassAwaitSSODialogComponent, LastPassPasswordPromptComponent } from "./dialog";
import { LastPassDirectImportService } from "./lastpass-direct-import.service";

/** TODO: add I18n */
@Component({
  selector: "import-lastpass",
  templateUrl: "import-lastpass.component.html",
  standalone: true,
  imports: [
    CommonModule,
    JslibModule,
    CalloutModule,
    TypographyModule,
    FormFieldModule,
    ReactiveFormsModule,
    IconButtonModule,
    CheckboxModule,
  ],
})
export class ImportLastPassComponent implements OnInit, OnDestroy {
  private _parentFormGroup: FormGroup;
  protected formGroup = this.formBuilder.group({
    email: [
      "",
      {
        validators: [Validators.required, Validators.email],
        asyncValidators: [this.submit()],
        updateOn: "submit",
      },
    ],
    includeSharedFolders: [false],
  });
  protected emailHint$ = this.formGroup.controls.email.statusChanges.pipe(
    map((status) => {
      if (status === "PENDING") {
        return this.i18nService.t("importingYourAccount");
      }
    })
  );

  @Output() csvDataLoaded = new EventEmitter<string>();

  constructor(
    private platformUtilsService: PlatformUtilsService,
    private formBuilder: FormBuilder,
    private controlContainer: ControlContainer,
    private dialogService: DialogService,
    private logService: LogService,
    private importService: LastPassDirectImportService,
    private i18nService: I18nService
  ) {}

  ngOnInit(): void {
    this._parentFormGroup = this.controlContainer.control as FormGroup;
    this._parentFormGroup.addControl("lastpassOptions", this.formGroup);
  }

  ngOnDestroy(): void {
    this._parentFormGroup.removeControl("lastpassOptions");
  }

  submit(): AsyncValidatorFn {
    return async () => {
      try {
        const email = this.formGroup.controls.email.value;

        await this.importService.verifyLastPassAccountExists(email);
        await this.handleImport();

        return null;
      } catch (error) {
        this.logService.error(`LP importer error: ${error}`);
        return {
          errors: {
            message: this.i18nService.t(this.getValidationErrorI18nKey(error)),
          },
        };
      }
    };
  }

  private getValidationErrorI18nKey(error: any): string {
    const message = typeof error === "string" ? error : error?.message;
    switch (message) {
      case "SSO auth cancelled":
      case "Second factor step is canceled by the user":
      case "Out of band step is canceled by the user":
        return "multifactorAuthenticationCancelled";
      case "No accounts to transform":
      case "Vault has not opened any accounts.":
        return "noLastPassDataFound";
      case "Invalid username":
      case "Invalid password":
        return "incorrectUsernameOrPassword";
      case "Second factor code is incorrect":
      case "Out of band authentication failed":
        return "multifactorAuthenticationFailed";
      default:
        return "errorOccurred";
    }
  }

  private async handleImport() {
    if (this.importService.isAccountFederated) {
      const oidc = await this.handleFederatedLogin();
      const csvData = await this.importService.handleFederatedImport(
        oidc.oidcCode,
        oidc.oidcState,
        this.formGroup.value.includeSharedFolders
      );
      this.csvDataLoaded.emit(csvData);
      return;
    }

    const email = this.formGroup.controls.email.value;
    const password = await LastPassPasswordPromptComponent.open(this.dialogService);
    const csvData = await this.importService.handleStandardImport(
      email,
      password,
      this.formGroup.value.includeSharedFolders
    );

    this.csvDataLoaded.emit(csvData);
  }

  private async handleFederatedLogin() {
    const ssoCallbackPromise = firstValueFrom(this.importService.ssoCallback$);
    const request = await this.importService.createOidcSigninRequest();
    this.platformUtilsService.launchUri(request.url);

    const cancelDialogRef = LastPassAwaitSSODialogComponent.open(this.dialogService);
    const cancelled = firstValueFrom(cancelDialogRef.closed).then((didCancel) => {
      throw Error("SSO auth cancelled");
    });

    return Promise.race<{
      oidcCode: string;
      oidcState: string;
    }>([cancelled, ssoCallbackPromise]).finally(() => {
      cancelDialogRef.close();
    });
  }
}
