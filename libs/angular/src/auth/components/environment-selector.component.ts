import { animate, state, style, transition, trigger } from "@angular/animations";
import { ConnectedPosition } from "@angular/cdk/overlay";
import { Component, EventEmitter, Output } from "@angular/core";
import { Router } from "@angular/router";
import { Observable, map, merge } from "rxjs";

import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import {
  EnvironmentService as EnvironmentServiceAbstraction,
  Region,
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
  protected ServerEnvironmentType = Region;

  @Output() onOpenSelfHostedSettings = new EventEmitter();
  protected selectedEnvironment$: Observable<Region>;
  protected isOpen = false;

  protected overlayPosition: ConnectedPosition[] = [
    {
      originX: "start",
      originY: "bottom",
      overlayX: "start",
      overlayY: "top",
    },
  ];

  constructor(
    protected environmentService: EnvironmentServiceAbstraction,
    protected configService: ConfigServiceAbstraction,
    protected router: Router,
  ) {
    // Update the environment info when the server config or environment URLs change.
    this.selectedEnvironment$ = merge(
      this.configService.serverConfig$,
      this.environmentService.urls,
    ).pipe(map(() => this.environmentService.selectedRegion));
  }

  protected async toggle(option: Region) {
    this.isOpen = !this.isOpen;
    if (option === null) {
      return;
    }

    if (option === Region.SelfHosted) {
      this.onOpenSelfHostedSettings.emit();
      return;
    }

    await this.environmentService.setRegion(option);
  }

  protected close() {
    this.isOpen = false;
  }
}
