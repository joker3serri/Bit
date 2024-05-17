import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from "@angular/forms";
import { firstValueFrom, map } from "rxjs";

import {
  Environment,
  EnvironmentService,
  Region,
  RegionConfig,
} from "@bitwarden/common/platform/abstractions/environment.service";

@Component({
  standalone: true,
  selector: "auth-environment-selector",
  template: "./environment-selector.component.html",
  imports: [CommonModule, ReactiveFormsModule],
})
export class EnvironmentSelectorComponent implements OnInit, OnDestroy {
  formGroup = this.formBuilder.group({
    selectedRegion: [null],
  });

  get selectedRegion(): FormControl {
    return this.formGroup.get("selectedRegion") as FormControl;
  }

  availableRegionConfigs: RegionConfig[] = this.environmentService.availableRegions();

  constructor(
    private formBuilder: FormBuilder,
    private environmentService: EnvironmentService,
  ) {}

  async ngOnInit() {
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

  ngOnDestroy() {}
}
