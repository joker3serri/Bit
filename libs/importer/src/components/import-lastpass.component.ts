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
import { map } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { TokenService } from "@bitwarden/common/auth/abstractions/token.service";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { PasswordGenerationService } from "@bitwarden/common/tools/generator/password";
import {
  CalloutModule,
  CheckboxModule,
  DialogService,
  FormFieldModule,
  IconButtonModule,
  TypographyModule,
} from "@bitwarden/components";

import { ClientInfo, Vault } from "../importers/lastpass/access";
// import { LastPassMultifactorPromptComponent } from "./dialog/lastpass-multifactor-prompt.component";
import { FederatedUserContext } from "../importers/lastpass/access/models";

import { ImportErrorDialogComponent } from "./dialog";
import { LastPassPasswordPromptComponent } from "./dialog/lastpass-password-prompt.component";
// import { Ui } from "../importers/lastpass/access/ui";
// import { DuoDevice, DuoChoice, DuoStatus } from "../importers/lastpass/access/duo-ui";
// import { OobResult } from "../importers/lastpass/access/oob-result";
// import { OtpResult } from "../importers/lastpass/access/otp-result";

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
    private passwordGenerationService: PasswordGenerationService,
    private formBuilder: FormBuilder,
    private controlContainer: ControlContainer,
    private dialogService: DialogService,
    private logService: LogService
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
    // class UiImplementation implements Ui {
    //   provideGoogleAuthPasscode: () => OtpResult;
    //   provideMicrosoftAuthPasscode: () => OtpResult;
    //   provideYubikeyPasscode: () => OtpResult;
    //   approveLastPassAuth: () => OobResult;
    //   approveDuo: () => OobResult;
    //   approveSalesforceAuth: () => OobResult;
    //   chooseDuoFactor: (devices: [DuoDevice]) => DuoChoice;
    //   provideDuoPasscode: (device: DuoDevice) => string;
    //   updateDuoStatus: (status: DuoStatus, text: string) => void;
    // }

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

        // TODO: Why is this called twice?
        await this.vault.setUserTypeContext(email).catch();

        await this.handleImport();

        return null;
      } catch (error) {
        this.dialogService.open<unknown, Error>(ImportErrorDialogComponent, {
          data: error,
        });
        this.logService.error(`LP importer error: ${error?.message || error}`);
        return {
          errors: {
            message: `An error has occurred.`,
          },
        };
      }
    };
  }

  async handleImport() {
    if (this.vault.userType.isFederated()) {
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
      // await this.vault.openFederated(federatedUser, ClientInfo.createClientInfo(), null);
    } else {
      // TODO Pass in to handleImport?
      const email = this.formGroup.controls.email.value;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const password = await LastPassPasswordPromptComponent.open(this.dialogService);
      await this.vault.open(email, password, ClientInfo.createClientInfo(), null);
    }

    const csvData = this.vault.accountsToExportedCsvString(
      this.formGroup.value.includeSharedFolders
    );
    this.csvDataLoaded.emit(csvData);
  }
}
