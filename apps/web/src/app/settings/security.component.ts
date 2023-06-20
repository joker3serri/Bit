import { Component } from "@angular/core";

import { KeyConnectorService } from "@bitwarden/common/auth/abstractions/key-connector.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

@Component({
  selector: "app-security",
  templateUrl: "security.component.html",
})
export class SecurityComponent {
  showChangePassword = true;

  constructor(
    private keyConnectorService: KeyConnectorService,
    private stateService: StateService
  ) {}

  async ngOnInit() {
    const accountDecriptionOptions = await this.stateService.getAcctDecryptionOptions();
    if (accountDecriptionOptions == null) {
      this.showChangePassword = accountDecriptionOptions.hasMasterPassword;
    }
    this.showChangePassword = !(await this.keyConnectorService.getUsesKeyConnector());
  }
}
