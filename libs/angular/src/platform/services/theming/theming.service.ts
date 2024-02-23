import { DOCUMENT } from "@angular/common";
import { Inject, Injectable } from "@angular/core";
import { defer, fromEvent, map, merge, of, Subscription, switchMap } from "rxjs";

import { ThemeType } from "@bitwarden/common/platform/enums";
import { KeyDefinition, StateProvider, THEMING_DISK } from "@bitwarden/common/platform/state";

import { WINDOW } from "../../../services/injection-tokens";

import { AbstractThemingService } from "./theming.service.abstraction";

const THEME_SELECTION = new KeyDefinition<ThemeType>(THEMING_DISK, "selection", {
  deserializer: (s) => s,
});

@Injectable()
export class ThemingService implements AbstractThemingService {
  private readonly selectedThemeState = this.stateProvider.getGlobal(THEME_SELECTION);

  readonly configuredTheme$ = this.selectedThemeState.state$.pipe(
    map((theme) => theme ?? ThemeType.Light),
  );

  protected readonly systemTheme$ = merge(
    defer(() => this.getSystemTheme()),
    fromEvent<MediaQueryListEvent>(
      // TODO: This uses this.window as opposed to the previous one which used the global window object
      this.window.matchMedia("(prefers-color-scheme: dark)"),
      "change",
    ).pipe(map((event) => (event.matches ? ThemeType.Dark : ThemeType.Light))),
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
    @Inject(WINDOW) private window: Window,
    @Inject(DOCUMENT) private document: Document,
  ) {}

  monitorThemeChanges(): Subscription {
    return this.theme$.subscribe((theme) => {
      this.document.documentElement.classList.remove(
        "theme_" + ThemeType.Light,
        "theme_" + ThemeType.Dark,
        "theme_" + ThemeType.Nord,
        "theme_" + ThemeType.SolarizedDark,
      );
      this.document.documentElement.classList.add("theme_" + theme);
    });
  }

  async updateConfiguredTheme(theme: ThemeType): Promise<void> {
    await this.selectedThemeState.update(() => theme, {
      shouldUpdate: (currentTheme) => currentTheme !== theme,
    });
  }

  // We use a media match query for monitoring the system theme on web and browser, but this doesn't work for electron apps on Linux.
  // In desktop we override these methods to track systemTheme with the electron renderer instead, which works for all OSs.
  protected async getSystemTheme(): Promise<ThemeType> {
    return this.window.matchMedia("(prefers-color-scheme: dark)").matches
      ? ThemeType.Dark
      : ThemeType.Light;
  }
}
export { THEME_SELECTION };
