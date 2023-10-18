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
import { OidcClient, Log as OidcLog } from "oidc-client-ts";
import { firstValueFrom, map } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/common/tools/generator/password";
import {
  CalloutModule,
  CheckboxModule,
  DialogService,
  FormFieldModule,
  IconButtonModule,
  TypographyModule,
} from "@bitwarden/components";

import { ClientInfo, Vault } from "../../importers/lastpass/access";
import { FederatedUserContext } from "../../importers/lastpass/access/models";

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
  private vault: Vault;

  private oidcClient: OidcClient;

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
        return "Finding your account...";
      }
    })
  );

  @Output() csvDataLoaded = new EventEmitter<string>();

  constructor(
    tokenService: TokenService,
    cryptoFunctionService: CryptoFunctionService,
    private platformUtilsService: PlatformUtilsService,
    private passwordGenerationService: PasswordGenerationServiceAbstraction,
    private formBuilder: FormBuilder,
    private controlContainer: ControlContainer,
    private dialogService: DialogService,
    private logService: LogService,
    private lastpassDirectImportService: LastPassDirectImportService,
    private i18nService: I18nService
  ) {
    this.vault = new Vault(cryptoFunctionService, tokenService);

    OidcLog.setLogger(console);
    OidcLog.setLevel(OidcLog.DEBUG);
  }

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

        await this.vault.setUserTypeContext(email);
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
    if (this.vault.userType.isFederated()) {
      const oidc = await this.handleFederatedLogin();
      await this.handleFederatedImport(oidc.oidcCode, oidc.oidcState);
      return;
    }

    await this.handleStandardImport();
  }

  private async handleStandardImport() {
    // TODO Pass in to handleImport?
    const email = this.formGroup.controls.email.value;
    const password = await LastPassPasswordPromptComponent.open(this.dialogService);
    await this.vault.open(
      email,
      password,
      ClientInfo.createClientInfo(),
      this.lastpassDirectImportService
    );

    this.transformCSV();
  }

  private async handleFederatedLogin() {
    this.oidcClient = new OidcClient({
      authority: this.vault.userType.openIDConnectAuthorityBase,
      client_id: this.vault.userType.openIDConnectClientId,
      // TODO: this is different per client
      redirect_uri: "bitwarden://sso-callback-lp",
      response_type: "code",
      scope: this.vault.userType.oidcScope,
      response_mode: "query",
      loadUserInfo: true,
    });

    const ssoCallbackPromsie = firstValueFrom(this.lastpassDirectImportService.ssoCallback$);

    const request = await this.oidcClient.createSigninRequest({
      state: {
        email: this.formGroup.controls.email.value,
        // Anything else that we need to preserve in userState?
      },
      nonce: await this.passwordGenerationService.generatePassword({
        length: 20,
        uppercase: true,
        lowercase: true,
        number: true,
      }),
    });
    this.platformUtilsService.launchUri(request.url);

    const cancelDialogRef = LastPassAwaitSSODialogComponent.open(this.dialogService);
    const cancelled = firstValueFrom(cancelDialogRef.closed).then((didCancel) => {
      throw Error("SSO auth cancelled");
    });

    return Promise.race<{
      oidcCode: string;
      oidcState: string;
    }>([cancelled, ssoCallbackPromsie]).finally(() => {
      cancelDialogRef.close();
    });
  }

  private async handleFederatedImport(oidcCode: string, oidcState: string) {
    const response = await this.oidcClient.processSigninResponse(
      this.oidcClient.settings.redirect_uri + "/?code=" + oidcCode + "&state=" + oidcState
    );
    const userState = response.userState as any;

    const federatedUser = new FederatedUserContext();
    federatedUser.idToken = response.access_token;
    federatedUser.accessToken = response.access_token;
    federatedUser.idpUserInfo = response.profile;
    federatedUser.username = userState.email;

    await this.vault.openFederated(
      federatedUser,
      ClientInfo.createClientInfo(),
      this.lastpassDirectImportService
    );

    this.transformCSV();
  }

  private transformCSV() {
    const csvData = this.vault.accountsToExportedCsvString(
      this.formGroup.value.includeSharedFolders
    );
    this.csvDataLoaded.emit(csvData);
  }
}
