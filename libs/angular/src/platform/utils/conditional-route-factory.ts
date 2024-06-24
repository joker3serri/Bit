import { Type, inject } from "@angular/core";
import { Route, Routes } from "@angular/router";
import { map } from "rxjs";

import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";

/**
 * @param defaultComponent The component to be used when the feature flag is off.
 * @param altComponent The component to be used when the feature flag is on.
 * @param featureFlag The feature flag to evaluate
 * @param routeOptions The shared route options to apply to both components.
 */
type ConditionalRouteFactoryConfig = {
  defaultComponent: Type<any>;
  altComponent: Type<any>;
  featureFlag: FeatureFlag;
  routeOptions: Omit<Route, "component">;
};

/**
 * Swap between two routes at runtime based on the value of a feature flag.
 * The routes share a common path and configuration but load different components.
 * @param config See {@link ConditionalRouteFactoryConfig}
 * @returns A tuple containing the conditional configuration for the two routes. This should be unpacked into your existing Routes array.
 * @example
 * const routes: Routes = [
 *   ...conditionalRouteFactory({
 *      defaultComponent: GroupsComponent,
 *      altComponent: GroupsNewComponent,
 *      featureFlag: FeatureFlag.GroupsComponentRefactor,
 *      routeOptions: {
 *        path: "groups",
 *        canActivate: [OrganizationPermissionsGuard],
 *      },
 *   }),
 * ]
 */
export function conditionalRouteFactory(config: ConditionalRouteFactoryConfig): Routes {
  const canMatch$ = () =>
    inject(ConfigService)
      .getFeatureFlag$(config.featureFlag)
      .pipe(map((flagValue) => flagValue === true));

  const defaultRoute = {
    ...config.routeOptions,
    component: config.defaultComponent,
  };

  const altRoute = {
    ...config.routeOptions,
    component: config.altComponent,
    canMatch: [canMatch$, ...(config.routeOptions.canMatch ?? [])],
  };

  // Return the alternate route first, so it is evaluated first.
  return [altRoute, defaultRoute];
}
