import { Type, inject } from "@angular/core";
import { CanMatchFn, Route, Routes } from "@angular/router";
import { map } from "rxjs";

import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";

/**
 * Helper function to swap between two components based on an async condition. The async condition is evaluated
 * as an `CanMatchFn` and supports Angular dependency injection via `inject()`.
 *
 * @example
 * ```ts
 * const routes = [
 *  ...componentRouteSwap(
 *     defaultComponent,
 *     altComponent,
 *     async () => {
 *       const configService = inject(ConfigService);
 *       return configService.getFeatureFlag(FeatureFlag.SomeFlag);
 *     },
 *     {
 *      path: 'some-path'
 *     }
 *   ),
 *   // Other routes...
 *  ];
 *  ```
 *
 * @param defaultComponent - The default component to render.
 * @param altComponent - The alternate component to render when the condition is met.
 * @param shouldSwap - The async function to determine if the alternate component should be rendered.
 * @param routeOptions - The shared route options to apply to both components.
 */
export function componentRouteSwap(
  defaultComponent: Type<any>,
  altComponent: Type<any>,
  shouldSwap: CanMatchFn,
  routeOptions: Route,
): Routes {
  const defaultRoute = {
    ...routeOptions,
    component: defaultComponent,
  };

  const altRoute: Route = {
    ...routeOptions,
    component: altComponent,
    canMatch: [shouldSwap, ...(routeOptions.canMatch ?? [])],
  };

  // Return the alternate route first, so it is evaluated first.
  return [altRoute, defaultRoute];
}

/**
 * Helper function to swap between two components based on the ExtensionRefresh feature flag.
 * @param defaultComponent - The current non-refreshed component to render.
 * @param refreshedComponent - The new refreshed component to render.
 * @param options - The shared route options to apply to both components.
 */
export function conditionalRouting(
  config: { defaultComponent: Type<any>; altComponent: Type<any>; featureFlag: FeatureFlag },
  routeOptions: Omit<Route, "component">,
): Routes {
  return componentRouteSwap(
    config.defaultComponent,
    config.altComponent,
    () =>
      inject(ConfigService)
        .getFeatureFlag$(config.featureFlag)
        .pipe(map((flagValue) => flagValue === true)),
    routeOptions,
  );
}
