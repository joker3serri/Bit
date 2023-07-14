import { Directive, Inject, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import * as DuoWebSDK from "duo_web_sdk";
import { first } from "rxjs/operators";

// eslint-disable-next-line no-restricted-imports
import { WINDOW } from "@bitwarden/angular/services/injection-tokens";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { LoginService } from "@bitwarden/common/auth/abstractions/login.service";
import { TwoFactorService } from "@bitwarden/common/auth/abstractions/two-factor.service";
import { TwoFactorProviderType } from "@bitwarden/common/auth/enums/two-factor-provider-type";
import { AuthResult } from "@bitwarden/common/auth/models/domain/auth-result";
import { ForceResetPasswordReason } from "@bitwarden/common/auth/models/domain/force-reset-password-reason";
import { TokenTwoFactorRequest } from "@bitwarden/common/auth/models/request/identity-token/token-two-factor.request";
import { TwoFactorEmailRequest } from "@bitwarden/common/auth/models/request/two-factor-email.request";
import { TwoFactorProviders } from "@bitwarden/common/auth/services/two-factor.service";
import { WebAuthnIFrame } from "@bitwarden/common/auth/webauthn-iframe";
// import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { AppIdService } from "@bitwarden/common/platform/abstractions/app-id.service";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
// import { AccountDecryptionOptions } from "@bitwarden/common/platform/models/domain/account";

import { CaptchaProtectedComponent } from "./captcha-protected.component";

@Directive()
export class TwoFactorComponent extends CaptchaProtectedComponent implements OnInit, OnDestroy {
  token = "";
  remember = false;
  webAuthnReady = false;
  webAuthnNewTab = false;
  providers = TwoFactorProviders;
  providerType = TwoFactorProviderType;
  selectedProviderType: TwoFactorProviderType = TwoFactorProviderType.Authenticator;
  webAuthnSupported = false;
  webAuthn: WebAuthnIFrame = null;
  title = "";
  twoFactorEmail: string = null;
  formPromise: Promise<any>;
  emailPromise: Promise<any>;
  identifier: string = null;
  onSuccessfulLogin: () => Promise<any>;
  onSuccessfulLoginNavigate: () => Promise<any>;

  protected loginRoute = "login";
  protected successRoute = "vault";
  protected trustedDeviceEncRoute = "login-initiated";

  constructor(
    protected authService: AuthService,
    protected router: Router,
    protected i18nService: I18nService,
    protected apiService: ApiService,
    protected platformUtilsService: PlatformUtilsService,
    @Inject(WINDOW) protected win: Window,
    protected environmentService: EnvironmentService,
    protected stateService: StateService,
    protected route: ActivatedRoute,
    protected logService: LogService,
    protected twoFactorService: TwoFactorService,
    protected appIdService: AppIdService,
    protected loginService: LoginService,
    protected configService: ConfigServiceAbstraction
  ) {
    super(environmentService, i18nService, platformUtilsService);
    this.webAuthnSupported = this.platformUtilsService.supportsWebAuthn(win);
  }

  async ngOnInit() {
    if (!this.authing || this.twoFactorService.getProviders() == null) {
      this.router.navigate([this.loginRoute]);
      return;
    }

    this.route.queryParams.pipe(first()).subscribe((qParams) => {
      if (qParams.identifier != null) {
        this.identifier = qParams.identifier;
      }
    });

    if (this.needsLock) {
      this.successRoute = "lock";
    }

    if (this.win != null && this.webAuthnSupported) {
      const webVaultUrl = this.environmentService.getWebVaultUrl();
      this.webAuthn = new WebAuthnIFrame(
        this.win,
        webVaultUrl,
        this.webAuthnNewTab,
        this.platformUtilsService,
        this.i18nService,
        (token: string) => {
          this.token = token;
          this.submit();
        },
        (error: string) => {
          this.platformUtilsService.showToast("error", this.i18nService.t("errorOccurred"), error);
        },
        (info: string) => {
          if (info === "ready") {
            this.webAuthnReady = true;
          }
        }
      );
    }

    this.selectedProviderType = this.twoFactorService.getDefaultProvider(this.webAuthnSupported);
    await this.init();
  }

  ngOnDestroy(): void {
    this.cleanupWebAuthn();
    this.webAuthn = null;
  }

  async init() {
    if (this.selectedProviderType == null) {
      this.title = this.i18nService.t("loginUnavailable");
      return;
    }

    this.cleanupWebAuthn();
    this.title = (TwoFactorProviders as any)[this.selectedProviderType].name;
    const providerData = this.twoFactorService.getProviders().get(this.selectedProviderType);
    switch (this.selectedProviderType) {
      case TwoFactorProviderType.WebAuthn:
        if (!this.webAuthnNewTab) {
          setTimeout(() => {
            this.authWebAuthn();
          }, 500);
        }
        break;
      case TwoFactorProviderType.Duo:
      case TwoFactorProviderType.OrganizationDuo:
        setTimeout(() => {
          DuoWebSDK.init({
            iframe: undefined,
            host: providerData.Host,
            sig_request: providerData.Signature,
            submit_callback: async (f: HTMLFormElement) => {
              const sig = f.querySelector('input[name="sig_response"]') as HTMLInputElement;
              if (sig != null) {
                this.token = sig.value;
                await this.submit();
              }
            },
          });
        }, 0);
        break;
      case TwoFactorProviderType.Email:
        this.twoFactorEmail = providerData.Email;
        if (this.twoFactorService.getProviders().size > 1) {
          await this.sendEmail(false);
        }
        break;
      default:
        break;
    }
  }

  async submit() {
    await this.setupCaptcha();

    if (this.token == null || this.token === "") {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("verificationCodeRequired")
      );
      return;
    }

    if (this.selectedProviderType === TwoFactorProviderType.WebAuthn) {
      if (this.webAuthn != null) {
        this.webAuthn.stop();
      } else {
        return;
      }
    } else if (
      this.selectedProviderType === TwoFactorProviderType.Email ||
      this.selectedProviderType === TwoFactorProviderType.Authenticator
    ) {
      this.token = this.token.replace(" ", "").trim();
    }

    try {
      await this.doSubmit();
    } catch {
      if (this.selectedProviderType === TwoFactorProviderType.WebAuthn && this.webAuthn != null) {
        this.webAuthn.start();
      }
    }
  }

  async doSubmit() {
    this.formPromise = this.authService.logInTwoFactor(
      new TokenTwoFactorRequest(this.selectedProviderType, this.token, this.remember),
      this.captchaToken
    );
    const response: AuthResult = await this.formPromise;
    if (this.handleCaptchaRequired(response)) {
      return;
    }
    if (this.onSuccessfulLogin != null) {
      this.loginService.clearValues();
      // Note: awaiting this will currently cause a hang on desktop & browser as they will wait for a full sync to complete
      // before nagivating to the success route.
      this.onSuccessfulLogin();
    }
    if (response.resetMasterPassword) {
      // TODO: for TDE, we are going to deprecate using response.resetMasterPassword
      // and instead rely on accountDecryptionOptions to determine if the user needs to set a password
      // Users are allowed to not have a MP if TDE feature enabled + TDE configured. Otherwise, they must set a MP
      // src: https://bitwarden.atlassian.net/browse/PM-2759?focusedCommentId=39438
      this.successRoute = "set-password";
    }
    if (response.forcePasswordReset !== ForceResetPasswordReason.None) {
      this.successRoute = "update-temp-password";
    }
    if (this.onSuccessfulLoginNavigate != null) {
      this.loginService.clearValues();
      // TODO: this function is defined when coming SSO with 2FA for authenticator app
      // see two goAfterLogIn functions (one in web login.component.ts and one in web two factor component.ts )
      await this.onSuccessfulLoginNavigate();
    } else {
      this.loginService.clearValues();

      // const ssoTo2faFlowActive = this.route.snapshot.queryParamMap.get("sso") === "true";
      // const trustedDeviceEncryptionFeatureActive = await this.configService.getFeatureFlagBool(
      //   FeatureFlag.TrustedDeviceEncryption
      // );

      // const accountDecryptionOptions: AccountDecryptionOptions =
      //   await this.stateService.getAccountDecryptionOptions();

      // if (
      //   ssoTo2faFlowActive &&
      //   trustedDeviceEncryptionFeatureActive &&
      //   accountDecryptionOptions.trustedDeviceOption !== undefined
      // ) {
      //   this.router.navigate([this.trustedDeviceEncRoute]);
      // } else {
      this.router.navigate([this.successRoute], {
        queryParams: {
          identifier: this.identifier,
        },
      });
      // }
    }
  }

  async sendEmail(doToast: boolean) {
    if (this.selectedProviderType !== TwoFactorProviderType.Email) {
      return;
    }

    if (this.emailPromise != null) {
      return;
    }

    if (this.authService.email == null) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("sessionTimeout")
      );
      return;
    }

    try {
      const request = new TwoFactorEmailRequest();
      request.email = this.authService.email;
      request.masterPasswordHash = this.authService.masterPasswordHash;
      request.ssoEmail2FaSessionToken = this.authService.ssoEmail2FaSessionToken;
      request.deviceIdentifier = await this.appIdService.getAppId();
      request.authRequestAccessCode = this.authService.accessCode;
      request.authRequestId = this.authService.authRequestId;
      this.emailPromise = this.apiService.postTwoFactorEmail(request);
      await this.emailPromise;
      if (doToast) {
        this.platformUtilsService.showToast(
          "success",
          null,
          this.i18nService.t("verificationCodeEmailSent", this.twoFactorEmail)
        );
      }
    } catch (e) {
      this.logService.error(e);
    }

    this.emailPromise = null;
  }

  authWebAuthn() {
    const providerData = this.twoFactorService.getProviders().get(this.selectedProviderType);

    if (!this.webAuthnSupported || this.webAuthn == null) {
      return;
    }

    this.webAuthn.init(providerData);
  }

  private cleanupWebAuthn() {
    if (this.webAuthn != null) {
      this.webAuthn.stop();
      this.webAuthn.cleanup();
    }
  }

  get authing(): boolean {
    return (
      this.authService.authingWithPassword() ||
      this.authService.authingWithSso() ||
      this.authService.authingWithUserApiKey() ||
      this.authService.authingWithPasswordless()
    );
  }

  get needsLock(): boolean {
    return this.authService.authingWithSso() || this.authService.authingWithUserApiKey();
  }
}
