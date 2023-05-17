import { inject } from "@angular/core";
import { Router, UrlTree } from "@angular/router";

import { ConfigServiceAbstraction } from "@bitwarden/common/abstractions/config/config.service.abstraction";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";

/**
 * Returns a CanActivateFn that checks if the boolean feature flag is enabled. If not, it shows an "Access Denied!"
 * toast and optionally redirects to the specified url.
 * @param featureFlag - The boolean feature flag to check
 * @param redirectUrlOnDisabled - Optional url to redirect to if the feature flag is disabled
 */
export const canAccessFeature = (
  featureFlag: FeatureFlag,
  redirectUrlOnDisabled?: string
): (() => Promise<boolean | UrlTree>) => {
  return async () => {
    const configService = inject(ConfigServiceAbstraction);
    const platformUtilsService = inject(PlatformUtilsService);
    const router = inject(Router);
    const i18nService = inject(I18nService);

    if (await configService.getFeatureFlagBool(featureFlag)) {
      return true;
    }

    platformUtilsService.showToast("error", null, i18nService.t("accessDenied"));

    if (redirectUrlOnDisabled != undefined) {
      return router.createUrlTree([redirectUrlOnDisabled]);
    } else {
      return false;
    }
  };
};
