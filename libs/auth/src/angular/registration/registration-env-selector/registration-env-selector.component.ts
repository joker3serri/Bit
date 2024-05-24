import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { Subject, from, map, of, pairwise, startWith, switchMap, takeUntil, tap } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  Environment,
  EnvironmentService,
  Region,
  RegionConfig,
} from "@bitwarden/common/platform/abstractions/environment.service";
import { DialogService, FormFieldModule, SelectModule } from "@bitwarden/components";

import { RegistrationSelfHostedEnvConfigDialogComponent } from "./registration-self-hosted-env-config-dialog.component";

@Component({
  standalone: true,
  selector: "auth-registration-env-selector",
  templateUrl: "registration-env-selector.component.html",
  imports: [CommonModule, JslibModule, ReactiveFormsModule, FormFieldModule, SelectModule],
})
export class RegistrationEnvSelectorComponent implements OnInit, OnDestroy {
  ServerEnvironmentType = Region;

  formGroup = this.formBuilder.group({
    selectedRegion: [null as RegionConfig | Region.SelfHosted | null, Validators.required],
  });

  get selectedRegion(): FormControl {
    return this.formGroup.get("selectedRegion") as FormControl;
  }

  availableRegionConfigs: RegionConfig[] = this.environmentService.availableRegions();

  private selectedRegionFromEnv: RegionConfig | Region.SelfHosted;

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private environmentService: EnvironmentService,
    private dialogService: DialogService,
  ) {}

  async ngOnInit() {
    await this.initSelectedRegionAndListenForEnvChanges();
    this.listenForSelectedRegionChanges();
  }

  private async initSelectedRegionAndListenForEnvChanges() {
    this.environmentService.environment$
      .pipe(
        map((env: Environment) => {
          const region: Region = env.getRegion();
          const regionConfig: RegionConfig = this.availableRegionConfigs.find(
            (availableRegionConfig) => availableRegionConfig.key === region,
          );

          if (regionConfig === undefined) {
            // Self hosted does not have a region config.
            return Region.SelfHosted;
          }

          return regionConfig;
        }),
        tap((selectedRegionFromEnv: RegionConfig | Region.SelfHosted) => {
          // Only set the value if it is different from the current value.
          if (selectedRegionFromEnv !== this.selectedRegion.value) {
            // Don't emit to avoid triggering the selectedRegion valueChanges subscription
            // which could loop back to this code.
            this.selectedRegion.setValue(selectedRegionFromEnv, { emitEvent: false });
          }

          // Save this off so we can reset the value to the previously selected region
          // if the self hosted settings are closed without saving.
          this.selectedRegionFromEnv = selectedRegionFromEnv;
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  private listenForSelectedRegionChanges() {
    this.selectedRegion.valueChanges
      .pipe(
        startWith(null), // required so that first user choice is not ignored
        pairwise(),
        switchMap(
          ([prevSelectedRegion, selectedRegion]: [
            RegionConfig | Region.SelfHosted | null,
            RegionConfig | Region.SelfHosted | null,
          ]) => {
            if (selectedRegion === null) {
              return of(null);
            }

            if (selectedRegion === Region.SelfHosted) {
              return from(
                RegistrationSelfHostedEnvConfigDialogComponent.open(this.dialogService),
              ).pipe(
                tap((result: boolean | undefined) => {
                  // Reset the value to the previously selected region or the current env setting
                  // if the self hosted env settings dialog is closed without saving.
                  if ((result === false || result === undefined) && prevSelectedRegion !== null) {
                    this.selectedRegion.setValue(prevSelectedRegion, { emitEvent: false });
                  } else {
                    this.selectedRegion.setValue(this.selectedRegionFromEnv, { emitEvent: false });
                  }
                }),
              );
            }

            // You have access to previousValue here if needed
            return from(this.environmentService.setEnvironment(selectedRegion.key));
          },
        ),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
