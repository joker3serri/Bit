import { Component } from "@angular/core";
import { ActivatedRoute } from "@angular/router";

import { OrganizationService } from "@bitwarden/common/abstractions/organization.service";

@Component({
  selector: "app-org-settings",
  templateUrl: "settings.component.html",
})
export class SettingsComponent {
  access2fa = false;
  accessSso = false;

  constructor(private route: ActivatedRoute, private organizationService: OrganizationService) {}

  ngOnInit() {
    this.route.parent.params.subscribe(async (params) => {
      const organization = await this.organizationService.get(params.organizationId);
      this.accessSso = organization.canManageSso && organization.useSso;
      this.access2fa = organization.use2fa;
    });
  }
}
