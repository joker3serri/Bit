import { Component, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { ActivatedRoute, Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";

@Component({
  selector: "app-home",
  templateUrl: "home.component.html",
})
export class HomeComponent implements OnInit {
  loginInitiated = false;
  private destroy$ = new Subject<void>();

  formGroup = this.formBuilder.group({
    email: ["", [Validators.required, Validators.email]],
    rememberEmail: [false],
  });

  constructor(
    protected platformUtilsService: PlatformUtilsService,
    private stateService: StateService,
    private formBuilder: FormBuilder,
    private router: Router,
    private i18nService: I18nService,
    private environmentService: EnvironmentService,
    private route: ActivatedRoute
  ) {}

  ngOnInit() {
    this.route?.queryParams.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      if (params) {
        const queryParamsEmail = params["email"];
        const queryParamsRememberEmail = params["rememberEmail"];
        if (
          queryParamsEmail != null &&
          queryParamsEmail.indexOf("@") > -1 &&
          queryParamsRememberEmail != null
        ) {
          this.setFormGroupValues(queryParamsEmail, JSON.parse(queryParamsRememberEmail));
        }
      }
    });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async initiateLogin(): Promise<void> {
    this.formGroup.patchValue({ email: await this.stateService.getRememberedEmail() });
    this.loginInitiated = true;
  }

  submit() {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccured"),
        this.i18nService.t("invalidEmail")
      );
      return;
    }
    if (this.formGroup.value.rememberEmail) {
      this.stateService.setRememberedEmail(this.formGroup.value.email);
    }
    this.router.navigate(["login"], { queryParams: { email: this.formGroup.value.email } });
  }

  get selfHostedDomain() {
    return this.environmentService.hasBaseUrl() ? this.environmentService.getWebVaultUrl() : null;
  }

  async setFormGroupValues(email: string, rememberEmail: boolean) {
    this.formGroup.patchValue({ email: email, rememberEmail: rememberEmail });
    this.loginInitiated = true;
  }
}
