import { animate, state, style, transition, trigger } from "@angular/animations";
import { ConnectedPosition } from "@angular/cdk/overlay";
import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { Subject, takeUntil } from "rxjs";

import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { EnvironmentService as EnvironmentServiceAbstraction } from "@bitwarden/common/platform/abstractions/environment.service";

@Component({
  selector: "environment-selector",
  templateUrl: "environment-selector.component.html",
  animations: [
    trigger("transformPanel", [
      state(
        "void",
        style({
          opacity: 0,
        })
      ),
      transition(
        "void => open",
        animate(
          "100ms linear",
          style({
            opacity: 1,
          })
        )
      ),
      transition("* => void", animate("100ms linear", style({ opacity: 0 }))),
    ]),
  ],
})
export class EnvironmentSelectorComponent implements OnInit, OnDestroy {
  @Output() onOpenSelfHostedSettings = new EventEmitter();
  euServerFlagEnabled: boolean;
  isOpen = false;
  showingModal = false;
  selectedEnvironment: ServerEnvironment;
  ServerEnvironmentType = ServerEnvironment;
  overlayPostition: ConnectedPosition[] = [
    {
      originX: "start",
      originY: "bottom",
      overlayX: "start",
      overlayY: "top",
    },
  ];
  protected componentDestroyed$: Subject<void> = new Subject();

  constructor(
    protected environmentService: EnvironmentServiceAbstraction,
    protected configService: ConfigServiceAbstraction,
    protected router: Router
  ) {}

  async ngOnInit() {
    this.configService.serverConfig$.pipe(takeUntil(this.componentDestroyed$)).subscribe(() => {
      this.updateEnvironmentInfo();
    });
    this.updateEnvironmentInfo();
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  async toggle(option: ServerEnvironment) {
    this.isOpen = !this.isOpen;
    if (option === null) {
      return;
    }
    if (option === ServerEnvironment.US) {
      await this.environmentService.setUrls(this.environmentService.usUrls);
    } else if (option === ServerEnvironment.EU) {
      await this.environmentService.setUrls(this.environmentService.euUrls);
    } else if (option === ServerEnvironment.SelfHosted) {
      this.onOpenSelfHostedSettings.emit();
    }
    this.updateEnvironmentInfo();
  }

  async updateEnvironmentInfo() {
    this.euServerFlagEnabled = !(await this.configService.getFeatureFlagBool(
      FeatureFlag.DisplayEuEnvironmentFlag
    ));

    if (
      this.environmentService.compareCurrentWithUrls(this.environmentService.usUrls) ||
      this.environmentService.isEmpty()
    ) {
      this.selectedEnvironment = ServerEnvironment.US;
    } else if (this.environmentService.compareCurrentWithUrls(this.environmentService.euUrls)) {
      this.selectedEnvironment = ServerEnvironment.EU;
    } else if (!this.environmentService.isEmpty()) {
      this.selectedEnvironment = ServerEnvironment.SelfHosted;
    } else {
      await this.environmentService.setUrls(this.environmentService.usUrls);
      this.selectedEnvironment = ServerEnvironment.US;
    }
  }

  close() {
    this.isOpen = false;
    this.updateEnvironmentInfo();
  }
}

enum ServerEnvironment {
  US = "US",
  EU = "EU",
  SelfHosted = "Self-hosted",
}
