import { inject } from "@angular/core";
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  createUrlTreeFromSnapshot,
  RouterStateSnapshot,
} from "@angular/router";

import { AuthGuard } from "@bitwarden/angular/auth/guards/auth.guard";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";

/**
 * Redirects from root `/sm` to first organization with access to SM
 */
export const canActivateSM: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(AuthService);
  const orgService = inject(OrganizationService);
  const authGuard = inject(AuthGuard);

  if ((await authService.getAuthStatus()) !== AuthenticationStatus.Unlocked) {
    return authGuard.canActivate(route, state);
  }

  const orgs = await orgService.getAll();
  const smOrg = orgs.find((o) => o.canAccessSecretsManager);
  if (smOrg) {
    return createUrlTreeFromSnapshot(route, ["/sm", smOrg.id]);
  }
  return createUrlTreeFromSnapshot(route, ["/vault"]);
};
