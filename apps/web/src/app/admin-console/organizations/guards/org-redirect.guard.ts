import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

import {
  canAccessOrgAdmin,
  OrganizationService,
} from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";

@Injectable({
  providedIn: "root",
})
export class OrganizationRedirectGuard implements CanActivate {
  constructor(
    private router: Router,
    private organizationService: OrganizationService,
    private configService: ConfigServiceAbstraction
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const org = this.organizationService.get(route.params.organizationId);
    const flexibleCollectionsEnabled = await this.configService.getFeatureFlag(
      FeatureFlag.FlexibleCollections,
      false
    );

    const customRedirect = route.data?.autoRedirectCallback;
    if (customRedirect) {
      let redirectPath = customRedirect(org, flexibleCollectionsEnabled);
      if (typeof redirectPath === "string") {
        redirectPath = [redirectPath];
      }
      return this.router.createUrlTree([state.url, ...redirectPath]);
    }

    if (canAccessOrgAdmin(org, flexibleCollectionsEnabled)) {
      return this.router.createUrlTree(["/organizations", org.id]);
    }
    return this.router.createUrlTree(["/"]);
  }
}
