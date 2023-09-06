import { Component, OnInit } from "@angular/core";

import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { RegionDomain } from "@bitwarden/common/platform/abstractions/environment.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

@Component({
  selector: "environment-selector",
  templateUrl: "environment-selector.component.html",
})
export class EnvironmentSelectorComponent implements OnInit {
  constructor(
    private configService: ConfigServiceAbstraction,
    private platformUtilsService: PlatformUtilsService
  ) {}

  isEuServer: boolean;
  isUsServer: boolean;
  showRegionSelector = false;
  euServerFlagEnabled: boolean;

  async ngOnInit() {
    this.euServerFlagEnabled = await this.configService.getFeatureFlagBool(
      FeatureFlag.DisplayEuEnvironmentFlag
    );
    const domain = Utils.getDomain(window.location.href);
    this.isEuServer = domain.includes(RegionDomain.EU);
    this.isUsServer = domain.includes(RegionDomain.US) || domain.includes(RegionDomain.USQA);
    this.showRegionSelector = !this.platformUtilsService.isSelfHost();
  }
}
