import { CommonModule } from "@angular/common";
import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { EMPTY, Subject, firstValueFrom, from, map, of, switchMap, takeUntil } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  Environment,
  EnvironmentService,
  Region,
  RegionConfig,
} from "@bitwarden/common/platform/abstractions/environment.service";
import { FormFieldModule, SelectModule } from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "auth-registration-env-selector",
  templateUrl: "registration-env-selector.component.html",
  imports: [CommonModule, JslibModule, ReactiveFormsModule, FormFieldModule, SelectModule],
})
export class RegistrationEnvSelectorComponent implements OnInit, OnDestroy {
  @Output() onOpenSelfHostedSettings = new EventEmitter();

  ServerEnvironmentType = Region;

  formGroup = this.formBuilder.group({
    selectedRegion: [null, Validators.required],
  });

  get selectedRegion(): FormControl {
    return this.formGroup.get("selectedRegion") as FormControl;
  }

  availableRegionConfigs: RegionConfig[] = this.environmentService.availableRegions();

  private destroy$ = new Subject<void>();

  constructor(
    private formBuilder: FormBuilder,
    private environmentService: EnvironmentService,
  ) {}

  async ngOnInit() {
    await this.initializeSelectedRegionValue();
    this.listenForSelectedRegionChanges();
  }

  private async initializeSelectedRegionValue() {
    const selectedRegionInitialValue: RegionConfig | Region = await firstValueFrom(
      this.environmentService.environment$.pipe(
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
      ),
    );

    this.selectedRegion.setValue(selectedRegionInitialValue);
  }

  private listenForSelectedRegionChanges() {
    this.selectedRegion.valueChanges
      .pipe(
        switchMap((selectedRegionConfig: RegionConfig | Region.SelfHosted | null) => {
          if (selectedRegionConfig === null) {
            return of(null);
          }

          if (selectedRegionConfig === Region.SelfHosted) {
            this.onOpenSelfHostedSettings.emit();
            return EMPTY;
          }

          return from(this.environmentService.setEnvironment(selectedRegionConfig.key));
        }),
        takeUntil(this.destroy$),
      )
      .subscribe();
  }

  ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
