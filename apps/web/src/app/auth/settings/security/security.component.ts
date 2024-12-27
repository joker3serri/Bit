import { Component, OnInit } from "@angular/core";

import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";

@Component({
  selector: "app-security",
  templateUrl: "security.component.html",
})
export class SecurityComponent implements OnInit {
  showChangePassword = true;
  deviceManagementAvailable$ = this.configService.getFeatureFlag$(FeatureFlag.DeviceManagement);

  constructor(
    private userVerificationService: UserVerificationService,
    private configService: ConfigService,
  ) {}

  async ngOnInit() {
    this.showChangePassword = await this.userVerificationService.hasMasterPassword();
  }
}
