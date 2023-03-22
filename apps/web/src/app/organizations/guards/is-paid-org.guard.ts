import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from "@angular/router";

import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";

@Injectable({
  providedIn: "root",
})
export class IsPaidOrgGuard implements CanActivate {
  constructor(
    private router: Router,
    private organizationService: OrganizationService,
    private messagingService: MessagingService
  ) {}

  async canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot) {
    const org = this.organizationService.get(route.params.organizationId);
    if (org == null) {
      return this.router.createUrlTree(["/"]);
    }

    if (org.isFreeOrg) {
      this.messagingService.send("upgradeOrganization", { organizationId: org.id });
    }

    return !org.isFreeOrg;
  }
}
