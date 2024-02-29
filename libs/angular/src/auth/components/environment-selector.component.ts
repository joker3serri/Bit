import { animate, state, style, transition, trigger } from "@angular/animations";
import { ConnectedPosition } from "@angular/cdk/overlay";
import { Component, EventEmitter, Output } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { Router } from "@angular/router";
import { Observable, map } from "rxjs";

import {
  EnvironmentService as EnvironmentServiceAbstraction,
  Region,
  RegionConfig,
} from "@bitwarden/common/platform/abstractions/environment.service";

@Component({
  selector: "environment-selector",
  templateUrl: "environment-selector.component.html",
  animations: [
    trigger("transformPanel", [
      state(
        "void",
        style({
          opacity: 0,
        }),
      ),
      transition(
        "void => open",
        animate(
          "100ms linear",
          style({
            opacity: 1,
          }),
        ),
      ),
      transition("* => void", animate("100ms linear", style({ opacity: 0 }))),
    ]),
  ],
})
export class EnvironmentSelectorComponent {
  @Output() onOpenSelfHostedSettings = new EventEmitter();
  isOpen = false;
  showingModal = false;
  selectedEnvironment: Region;
  ServerEnvironmentType = Region;
  overlayPosition: ConnectedPosition[] = [
    {
      originX: "start",
      originY: "bottom",
      overlayX: "start",
      overlayY: "top",
    },
  ];

  protected AvailableRegions = this.environmentService.availableRegions();
  protected selectedRegion$: Observable<RegionConfig | undefined> =
    this.environmentService.environment$.pipe(
      takeUntilDestroyed(),
      map((e) => e.getRegion()),
      map((r) => this.AvailableRegions.find((ar) => ar.key === r)),
    );

  constructor(
    protected environmentService: EnvironmentServiceAbstraction,
    protected router: Router,
  ) {}

  async toggle(option: Region) {
    this.isOpen = !this.isOpen;
    if (option === null) {
      return;
    }

    if (option === Region.SelfHosted) {
      this.onOpenSelfHostedSettings.emit();
      return;
    }

    await this.environmentService.setEnvironment(option);
  }

  close() {
    this.isOpen = false;
  }
}
