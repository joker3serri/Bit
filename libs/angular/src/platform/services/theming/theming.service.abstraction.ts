import { Observable, Subscription } from "rxjs";

import { ThemeType } from "@bitwarden/common/platform/enums";

/**
 * A service for managing and observing the current application theme.
 */
// FIXME: Rename to ThemingService
export abstract class AbstractThemingService {
  /**
   * The user configured theme.
   */
  configuredTheme$: Observable<ThemeType>;
  /**
   * The effective theme based on the user configured choice and the current system theme if
   * the configured choice is {@link ThemeType.System}.
   */
  theme$: Observable<ThemeType>;
  /**
   * Monitors effective theme changes and applies changes to the provided document.
   * @param document The document that should have theme classes applied to it.
   *
   * @returns A subscription that can be unsubscribed from to cancel the monitoring.
   */
  monitorThemeChanges: (document: Document) => Subscription;
  /**
   * A method for updating the current user configured theme.
   * @param theme The chosen user theme.
   */
  updateConfiguredTheme: (theme: ThemeType) => Promise<void>;
}
