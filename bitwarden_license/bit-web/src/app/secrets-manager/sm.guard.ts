import { inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  createUrlTreeFromSnapshot,
  RouterStateSnapshot,
} from "@angular/router";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";

/**
 * Redirects from root `/sm` to first organization with access to SM
 */
export const canActivateSM: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
) => {
  const orgs = await inject(OrganizationService).getAll();
  const smOrg = orgs.find((o) => o.canAccessSecretsManager);
  if (smOrg) {
    return createUrlTreeFromSnapshot(route, ["sm", smOrg.id]);
  }
  return createUrlTreeFromSnapshot(route, ["/vault"]);
};
