import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

import {
  canAccessOrgAdmin,
  OrganizationService,
} from "@bitwarden/common/abstractions/organization/organization.service.abstraction";

@Injectable({
  providedIn: "root",
})
export class OrganizationRedirectGuard implements CanActivate {
  constructor(private router: Router, private organizationService: OrganizationService) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const org = this.organizationService.get(route.params.organizationId);

    const customRedirect = route.data?.autoRedirectCallback;
    const redirectPath = customRedirect(org);
    if (customRedirect) {
      return this.router.createUrlTree([state.url, redirectPath]);
    }
    return canAccessOrgAdmin(org)
      ? this.router.createUrlTree(["/organizations", org.id])
      : this.router.createUrlTree(["/"]);
  }
}
