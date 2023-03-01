import { Component } from "@angular/core";

import { Organization } from "@bitwarden/common/models/domain/organization";

import { SecretsManagerLogo } from "./secrets-manager-logo";

@Component({
  selector: "sm-navigation",
  templateUrl: "./navigation.component.html",
})
export class NavigationComponent {
  protected orgFilter = (org: Organization) => org.canAccessSecretsManager;
  protected readonly logo = SecretsManagerLogo;
}
