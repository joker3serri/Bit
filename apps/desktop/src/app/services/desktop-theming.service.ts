import { Injectable } from "@angular/core";
import { defer, fromEventPattern, merge } from "rxjs";

import { ThemingService } from "@bitwarden/angular/platform/services/theming/theming.service";
import { ThemeType } from "@bitwarden/common/platform/enums";

@Injectable()
export class DesktopThemingService extends ThemingService {
  protected readonly systemTheme$ = merge(
    defer(() => ipc.platform.getSystemTheme()),
    fromEventPattern<ThemeType>((handler) => {
      return ipc.platform.onSystemThemeUpdated((theme) => handler(theme));
    }),
  );
}
