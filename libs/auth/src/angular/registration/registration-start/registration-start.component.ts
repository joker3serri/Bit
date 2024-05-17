import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  ReactiveFormsModule,
  ValidatorFn,
  Validators,
} from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subject, filter, firstValueFrom, from, map, switchMap, takeUntil } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ClientType } from "@bitwarden/common/enums";
import {
  Environment,
  EnvironmentService,
  Region,
  RegionConfig,
} from "@bitwarden/common/platform/abstractions/environment.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import {
  AsyncActionsModule,
  ButtonModule,
  CheckboxModule,
  DialogService,
  FormFieldModule,
  IconModule,
  LinkModule,
  SelectModule,
} from "@bitwarden/components";

// import { EnvironmentComponent as DesktopEnvironmentComponent } from "../../../../../../apps/desktop/src/auth/environment.component";
import { RegistrationCheckEmailIcon } from "../../icons/registration-check-email.icon";

enum RegistrationStartState {
  USER_DATA_ENTRY = "UserDataEntry",
  CHECK_EMAIL = "CheckEmail",
}

@Component({
  standalone: true,
  selector: "auth-registration-start",
  templateUrl: "./registration-start.component.html",
  imports: [
    CommonModule,
    ReactiveFormsModule,
    JslibModule,
    FormFieldModule,
    AsyncActionsModule,
    CheckboxModule,
    ButtonModule,
    LinkModule,
    IconModule,
    SelectModule,
  ],
})
export class RegistrationStartComponent implements OnInit, OnDestroy {
  state: RegistrationStartState = RegistrationStartState.USER_DATA_ENTRY;
  RegistrationStartState = RegistrationStartState;
  readonly Icons = { RegistrationCheckEmailIcon };

  isSelfHost = false;
  clientType: ClientType;
  ClientType = ClientType;
  isBrowserOrDesktop = false;

  formGroup = this.formBuilder.group({
    email: ["", [Validators.required, Validators.email]],
    name: [""],
    acceptPolicies: [false, [this.acceptPoliciesValidator()]],
    selectedRegion: [null],
  });

  get email(): FormControl {
    return this.formGroup.get("email") as FormControl;
  }

  get name(): FormControl {
    return this.formGroup.get("name") as FormControl;
  }

  get acceptPolicies(): FormControl {
    return this.formGroup.get("acceptPolicies") as FormControl;
  }

  get selectedRegion(): FormControl {
    return this.formGroup.get("selectedRegion") as FormControl;
  }

  emailReadonly: boolean = false;

  availableRegionConfigs: RegionConfig[] = this.environmentService.availableRegions();

  showErrorSummary = false;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private route: ActivatedRoute,
    private platformUtilsService: PlatformUtilsService,
    private environmentService: EnvironmentService,
    private dialogService: DialogService,
  ) {
    this.isSelfHost = platformUtilsService.isSelfHost();
    this.clientType = platformUtilsService.getClientType();

    // TODO: remove this.
    // this.clientType = ClientType.Desktop;

    this.isBrowserOrDesktop =
      this.clientType === ClientType.Desktop || this.clientType === ClientType.Browser;
  }

  async ngOnInit() {
    this.listenForQueryParamChanges();

    if (this.isBrowserOrDesktop) {
      await this.initForBrowserOrDesktop();
    }
  }

  private listenForQueryParamChanges() {
    this.route.queryParams.pipe(takeUntil(this.destroy$)).subscribe((qParams) => {
      if (qParams.email != null && qParams.email.indexOf("@") > -1) {
        this.email?.setValue(qParams.email);
        this.emailReadonly = qParams.emailReadonly === "true";
      }
    });
  }

  private async initForBrowserOrDesktop() {
    await this.initializeSelectedRegion();
  }

  private async initializeSelectedRegion() {
    this.selectedRegion.setValidators(Validators.required);

    // TODO: figure out if observable or promise is better here
    // this.environmentService.environment$
    //   .pipe(
    //     map((env: Environment) => env.getRegion()),
    //     map((region: Region) =>
    //       this.availableRegionConfigs.find(
    //         (availableRegionConfig) => availableRegionConfig.key === region,
    //       ),
    //     ),
    //     takeUntil(this.destroy$),
    //   )
    //   .subscribe((regionConfig: RegionConfig | undefined) => {
    //     this.selectedRegion.setValue(regionConfig);
    //   });

    const selectedRegionConfig: RegionConfig | undefined = await firstValueFrom(
      this.environmentService.environment$.pipe(
        map((env: Environment) => env.getRegion()),
        map((region: Region) =>
          this.availableRegionConfigs.find(
            (availableRegionConfig) => availableRegionConfig.key === region,
          ),
        ),
      ),
    );

    this.selectedRegion.setValue(selectedRegionConfig);
  }

  private listenForSelectedRegionChanges() {
    this.selectedRegion.valueChanges
      .pipe(
        filter((regionConfig: RegionConfig | null) => regionConfig !== null),
        switchMap((regionConfig: RegionConfig) => {
          if (regionConfig.key === Region.SelfHosted) {
            // Open self-hosted settings modal based on client type

            // if (this.clientType === ClientType.Desktop) {
            //   this.openDesktopSelfHostedSettingsDialog();
            // }

            // if (this.clientType === ClientType.Browser) {
            //   this.openBrowserExtensionSelfHostedSettingsDialog();
            // }

            return;
          }

          return from(this.environmentService.setEnvironment(regionConfig.key));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  // private openDesktopSelfHostedSettingsDialog() {
  //   this.dialogService.open(DesktopEnvironmentComponent);
  // }

  // private openBrowserExtensionSelfHostedSettingsDialog() {
  //   // this.dialogService.open(EnvironmentComponent);
  // }

  submit = async () => {
    const valid = this.validateForm();

    if (!valid) {
      return;
    }

    // TODO: Implement registration logic

    this.state = RegistrationStartState.CHECK_EMAIL;
    document.getElementById("check_your_email_heading")?.focus();
  };

  private validateForm(): boolean {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      this.showErrorSummary = true;
    }

    return this.formGroup.valid;
  }

  private acceptPoliciesValidator(): ValidatorFn {
    return (control: AbstractControl) => {
      const ctrlValue = control.value;

      return !ctrlValue && !this.isSelfHost ? { required: true } : null;
    };
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
