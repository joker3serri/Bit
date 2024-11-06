import { inject } from "@angular/core";
import { CanActivateFn } from "@angular/router";

import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";

export const integrationPageEnabled: CanActivateFn = async () => {
  const configService = inject(ConfigService);

  const integrationPageEnabled = await configService.getFeatureFlag(
    FeatureFlag.PM14505AdminConsoleIntegrationPage,
  );

  if (integrationPageEnabled) {
    return true;
  }

  return false;
};
