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
import { FormFieldModule } from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "auth-registration-env-selector",
  templateUrl: "registration-env-selector.component.html",
  imports: [CommonModule, JslibModule, ReactiveFormsModule, FormFieldModule],
})
export class EnvironmentSelectorComponent implements OnInit, OnDestroy {
  @Output() onOpenSelfHostedSettings = new EventEmitter();

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
        switchMap((selectedRegionConfig: RegionConfig | null) => {
          if (selectedRegionConfig === null) {
            return of(null);
          }

          if (selectedRegionConfig.key === Region.SelfHosted) {
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
