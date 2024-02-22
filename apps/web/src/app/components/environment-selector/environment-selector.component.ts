import { Component, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import {
  EnvironmentService,
  SelectableRegion,
} from "@bitwarden/common/platform/abstractions/environment.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

@Component({
  selector: "environment-selector",
  templateUrl: "environment-selector.component.html",
})
export class EnvironmentSelectorComponent implements OnInit {
  constructor(
    private platformUtilsService: PlatformUtilsService,
    private environmentService: EnvironmentService,
    private router: Router,
  ) {}

  protected AvailableRegions = this.environmentService.availableRegions();
  protected currentRegion?: SelectableRegion;

  protected showRegionSelector = false;
  protected routeAndParams: string;

  async ngOnInit() {
    this.showRegionSelector = !this.platformUtilsService.isSelfHost();
    this.routeAndParams = `/#${this.router.url}`;

    const domain = Utils.getDomain(window.location.href);
    this.currentRegion = this.AvailableRegions.find(
      (r) => Utils.getDomain(r.urls.webVault) === domain,
    );
  }
}
