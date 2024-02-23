import { Observable, Subscription } from "rxjs";

import { ThemeType } from "@bitwarden/common/platform/enums";

export abstract class AbstractThemingService {
  /**
   *
   */
  configuredTheme$: Observable<ThemeType>;
  /**
   *
   */
  theme$: Observable<ThemeType>;
  /**
   *
   */
  monitorThemeChanges: () => Subscription;
  /**
   *
   */
  updateConfiguredTheme: (theme: ThemeType) => Promise<void>;
}
