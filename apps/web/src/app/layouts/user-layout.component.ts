import { Component, OnInit } from "@angular/core";

import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigServiceAbstraction as ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";

@Component({
  selector: "app-user-layout",
  templateUrl: "user-layout.component.html",
})
export class UserLayoutComponent implements OnInit {
  protected showPaymentMethodWarningBanners$ = this.configService.getFeatureFlag$(
    FeatureFlag.ShowPaymentMethodWarningBanners,
    false,
  );

  constructor(private configService: ConfigService) {}

  ngOnInit() {
    document.body.classList.remove("layout_frontend");
  }
}
