import { Injectable } from "@angular/core";
import { defer, fromEventPattern, merge } from "rxjs";

import { AngularThemingService } from "@bitwarden/angular/platform/services/theming/angular-theming.service";
import { ThemeType } from "@bitwarden/common/platform/enums";
import { ThemeStateService } from "@bitwarden/common/platform/theming/theme-state.service";

@Injectable()
export class DesktopThemingService extends AngularThemingService {
  private static createSystemThemeObservable() {
    return merge(
      defer(() => ipc.platform.getSystemTheme()),
      fromEventPattern<ThemeType>((handler) => {
        return ipc.platform.onSystemThemeUpdated((theme) => handler(theme));
      }),
    );
  }

  constructor(themeStateService: ThemeStateService) {
    super(themeStateService, DesktopThemingService.createSystemThemeObservable());
  }
}
