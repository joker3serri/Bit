import { Component, Input, OnInit } from "@angular/core";
import { combineLatest, map, Observable } from "rxjs";

import {
  canAccessAdmin,
  OrganizationService,
} from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

@Component({
  selector: "app-organization-switcher",
  templateUrl: "organization-switcher.component.html",
})
export class OrganizationSwitcherComponent implements OnInit {
  constructor(
    private organizationService: OrganizationService,
    private i18nService: I18nService,
    private configService: ConfigServiceAbstraction
  ) {}

  @Input() activeOrganization: Organization = null;
  organizations$: Observable<Organization[]>;

  loaded = false;

  async ngOnInit() {
    this.organizations$ = combineLatest([
      this.organizationService.memberOrganizations$,
      this.configService.getFeatureFlag$(FeatureFlag.FlexibleCollections, false),
    ]).pipe(
      map(([orgs, flexibleCollectionsEnabled]) => {
        const canAccess = canAccessAdmin(this.i18nService, flexibleCollectionsEnabled);
        return canAccess ? orgs.sort(Utils.getSortFunction(this.i18nService, "name")) : [];
      })
    );

    this.loaded = true;
  }
}
