import { animate, state, style, transition, trigger } from "@angular/animations";
import { ConnectedPosition } from "@angular/cdk/overlay";
import { Component, EventEmitter, OnDestroy, OnInit, Output } from "@angular/core";
import { Router } from "@angular/router";
import { Subject } from "rxjs";

import { ConfigServiceAbstraction } from "@bitwarden/common/abstractions/config/config.service.abstraction";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";

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
  isOpen = false;
  showingModal = false;
  selectedEnvironment: ServerEnvironment;
  ServerEnvironmentType = ServerEnvironment;
  euServerFlagEnabled: boolean;
  overlayPostition: ConnectedPosition[] = [
    {
      originX: "start",
      originY: "bottom",
      overlayX: "start",
      overlayY: "top",
    },
  ];
  private componentDestroyed$: Subject<void> = new Subject();

  constructor(
    private environmentService: EnvironmentService,
    private configService: ConfigServiceAbstraction,
    private router: Router
  ) {}

  async ngOnInit() {
    this.euServerFlagEnabled = await this.configService.getFeatureFlagBool(
      FeatureFlag.DisplayEuEnvironmentFlag
    );
    this.updateEnvironmentInfo();
  }

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }

  async toggle(option: ServerEnvironment) {
    this.isOpen = !this.isOpen;
    if (option === ServerEnvironment.EU) {
      await this.environmentService.setUrls({ base: "https://vault.bitwarden.eu" });
    } else if (option === ServerEnvironment.US) {
      await this.environmentService.setUrls({ base: "https://vault.bitwarden.com" });
    } else if (option === ServerEnvironment.SelfHosted) {
      this.openSelfHostedSettings();
    }
    this.updateEnvironmentInfo();
  }

  updateEnvironmentInfo() {
    const webvaultUrl = this.environmentService.getWebVaultUrl();
    if (this.environmentService.isSelfHosted()) {
      this.selectedEnvironment = ServerEnvironment.SelfHosted;
    } else if (webvaultUrl != null && webvaultUrl.includes("bitwarden.eu")) {
      this.selectedEnvironment = ServerEnvironment.EU;
    } else {
      this.selectedEnvironment = ServerEnvironment.US;
    }
  }

  close() {
    this.isOpen = false;
    this.updateEnvironmentInfo();
  }

  async openSelfHostedSettings() {
    this.onOpenSelfHostedSettings.emit();
    this.router.navigate(["environment"]);
  }
}

enum ServerEnvironment {
  US = "US",
  EU = "EU",
  SelfHosted = "Self-hosted",
}
