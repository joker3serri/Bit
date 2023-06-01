import { Component, Input, OnInit } from "@angular/core";

import { ConfigServiceAbstraction } from "@bitwarden/common/abstractions/config/config.service.abstraction";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { Utils } from "@bitwarden/common/misc/utils";

@Component({
  selector: "environment-selector",
  templateUrl: "environment-selector.component.html",
})
export class EnvironmentSelectorComponent implements OnInit {
  constructor(private configService: ConfigServiceAbstraction) {}
  @Input() hasFlags: boolean;
  isEuServer = true;
  euServerFlagEnabled: boolean;

  async ngOnInit() {
    this.euServerFlagEnabled = await this.configService.getFeatureFlagBool(
      FeatureFlag.DisplayEuEnvironmentFlag
    );
    this.isEuServer = Utils.getDomain(window.location.href).includes(".eu");
  }
}
