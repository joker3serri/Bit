import { Type, inject } from "@angular/core";
import { Route, Routes } from "@angular/router";
import { map } from "rxjs";

import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";

/**
 * Swap between two routes at runtime based on the value of a feature flag. The routes share a common path and configuration.
 * @param defaultComponent - The component to be used when the feature flag is off.
 * @param altComponent - The component to be used when the feature flag is on.
 * @param options - The shared route options to apply to both components.
 */
export function conditionalRouteFactory(
  config: { defaultComponent: Type<any>; altComponent: Type<any>; featureFlag: FeatureFlag },
  routeOptions: Omit<Route, "component">,
): Routes {
  const canMatch$ = () =>
    inject(ConfigService)
      .getFeatureFlag$(config.featureFlag)
      .pipe(map((flagValue) => flagValue === true));

  const defaultRoute = {
    ...routeOptions,
    component: config.defaultComponent,
  };

  const altRoute = {
    ...routeOptions,
    component: config.altComponent,
    canMatch: [canMatch$, ...(routeOptions.canMatch ?? [])],
  };

  // Return the alternate route first, so it is evaluated first.
  return [altRoute, defaultRoute];
}
