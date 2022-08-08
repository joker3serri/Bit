import { Injectable } from "@angular/core";
import { ActivatedRouteSnapshot, CanActivate, Router } from "@angular/router";

import { ProviderService } from "@bitwarden/common/abstractions/provider.service";
import { Provider } from "@bitwarden/common/models/domain/provider";

@Injectable()
export class ProviderPermissionsGuard implements CanActivate {
  constructor(private providerService: ProviderService, private router: Router) {}

  async canActivate(route: ActivatedRouteSnapshot) {
    const provider = await this.providerService.get(route.params.providerId);
    if (provider == null) {
      return this.router.createUrlTree(["/"]);
    }

    const permissionsCallback: (provider: Provider) => boolean = route.data?.permissions;
    const hasSpecifiedPermissions = permissionsCallback == null || permissionsCallback(provider);

    if (!hasSpecifiedPermissions) {
      return this.router.createUrlTree(["/providers", provider.id]);
    }

    return true;
  }
}
