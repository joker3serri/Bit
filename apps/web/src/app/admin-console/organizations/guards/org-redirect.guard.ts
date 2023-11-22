import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

import {
  canAccessOrgAdmin,
  OrganizationService,
} from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
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

    const customRedirect = route.data?.autoRedirectCallback;
    if (customRedirect) {
      let redirectPath = await customRedirect(org, this.configService);
      if (typeof redirectPath === "string") {
        redirectPath = [redirectPath];
      }
      return this.router.createUrlTree([state.url, ...redirectPath]);
    }

    if (await canAccessOrgAdmin(org, this.configService)) {
      return this.router.createUrlTree(["/organizations", org.id]);
    }
    return this.router.createUrlTree(["/"]);
  }
}
