import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { Observable, combineLatest, map } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { TypographyModule } from "@bitwarden/components";

/**
 * Component for the Danger Zone section of the Account/Organization Settings page.
 */
@Component({
  selector: "app-danger-zone",
  templateUrl: "danger-zone.component.html",
  standalone: true,
  imports: [TypographyModule, JslibModule, CommonModule],
})
export class DangerZoneComponent implements OnInit {
  constructor(
    private configService: ConfigService,
    private organizationService: OrganizationService,
  ) {}
  managedUser$: Observable<boolean>;

  ngOnInit(): void {
    const isAccountDeprovisioningEnabled$ = this.configService.getFeatureFlag$(
      FeatureFlag.AccountDeprovisioning,
    );

    const userIsManagedByOrganization$ = this.organizationService.organizations$.pipe(
      map((organizations) => organizations.some((o) => o.userIsManagedByOrganization === true)),
    );

    this.managedUser$ = combineLatest([
      isAccountDeprovisioningEnabled$,
      userIsManagedByOrganization$,
    ]).pipe(
      map(
        ([isAccountDeprovisioningEnabled, userIsManagedByOrganization]) =>
          isAccountDeprovisioningEnabled && userIsManagedByOrganization,
      ),
    );
  }
}
