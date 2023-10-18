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
    private lastpassDirectImportService: LastPassDirectImportService
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

        try {
          await this.vault.setUserTypeContext(email);
        } catch {
          return {
            accountNotFound: {
              message: "Cannot retrieve account",
            },
          };
        }

        await this.handleImport();

        return null;
      } catch (error) {
        // this.dialogService.open<unknown, Error>(ImportErrorDialogComponent, {
        //   data: error,
        // });
        const message = error?.message || error;
        this.logService.error(`LP importer error: ${message}`);
        return {
          errors: {
            message,
          },
        };
      }
    };
  }

  private async handleImport() {
    if (this.vault.userType.isFederated()) {
      await this.handleFederatedLogin();
      return;
    }

    await this.handleStandardImport();
  }

  private async handleStandardImport() {
    // TODO Pass in to handleImport?
    const email = this.formGroup.controls.email.value;
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    }>([
      cancelled,
      // SSOMessageCallbackPromise
    ]);
  }

  //TODO Call this when message is received from callback
  private async handleFederatedImport() {
    // TODO: do something while waiting on SSO to callback and finish?
    // Need to return code and state from the SSO callback

    const oidcCode = "";
    const oidcState = "";
    const response = await this.oidcClient.processSigninResponse(
      this.oidcClient.settings.redirect_uri + "&code=" + oidcCode + "&state=" + oidcState
    );
    const userState = response.userState as any;

    const federatedUser = new FederatedUserContext();
    federatedUser.idToken = response.access_token;
    federatedUser.accessToken = response.access_token;
    federatedUser.idpUserInfo = response.profile;
    federatedUser.username = userState.email;

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    // const passcode = await LastPassMultifactorPromptComponent.open(this.dialogService);
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
