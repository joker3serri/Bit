import { Injectable } from "@angular/core";
import { fromEvent, map, merge, Observable, of, Subscription, switchMap } from "rxjs";

import { ThemeType } from "@bitwarden/common/platform/enums";
import { KeyDefinition, StateProvider, THEMING_DISK } from "@bitwarden/common/platform/state";

import { AbstractThemingService } from "./theming.service.abstraction";

const THEME_SELECTION = new KeyDefinition<ThemeType>(THEMING_DISK, "selection", {
  deserializer: (s) => s,
});

@Injectable()
export class AngularThemingService implements AbstractThemingService {
  /**
   * Creates a system theme observable based on watching the given window.
   * @param window The window that should be watched for system theme changes.
   * @returns An observable that will track the system theme.
   */
  static createSystemThemeFromWindow(window: Window): Observable<ThemeType> {
    return merge(
      // This observable should always emit at least once, so go and get the current system theme designation
      of(
        window.matchMedia("(prefers-color-scheme: dark)").matches
          ? ThemeType.Dark
          : ThemeType.Light,
      ),
      // Start listening to changes
      fromEvent<MediaQueryListEvent>(
        window.matchMedia("(prefers-color-scheme: dark)"),
        "change",
      ).pipe(map((event) => (event.matches ? ThemeType.Dark : ThemeType.Light))),
    );
  }

  private readonly selectedThemeState = this.stateProvider.getGlobal(THEME_SELECTION);

  readonly configuredTheme$ = this.selectedThemeState.state$.pipe(
    map((theme) => theme ?? ThemeType.Light),
  );

  readonly theme$ = this.configuredTheme$.pipe(
    switchMap((configuredTheme) => {
      if (configuredTheme === ThemeType.System) {
        return this.systemTheme$;
      }

      return of(configuredTheme);
    }),
  );

  constructor(
    private stateProvider: StateProvider,
    private systemTheme$: Observable<ThemeType>,
  ) {}

  monitorThemeChanges(document: Document): Subscription {
    return this.theme$.subscribe((theme) => {
      document.documentElement.classList.remove(
        "theme_" + ThemeType.Light,
        "theme_" + ThemeType.Dark,
        "theme_" + ThemeType.Nord,
        "theme_" + ThemeType.SolarizedDark,
      );
      document.documentElement.classList.add("theme_" + theme);
    });
  }

  async updateConfiguredTheme(theme: ThemeType): Promise<void> {
    await this.selectedThemeState.update(() => theme, {
      shouldUpdate: (currentTheme) => currentTheme !== theme,
    });
  }
}
