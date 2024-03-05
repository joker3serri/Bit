import { Injectable } from "@angular/core";
import { defer, fromEventPattern, merge } from "rxjs";

import { AngularThemingService } from "@bitwarden/angular/platform/services/theming/theming.service";
import { ThemeType } from "@bitwarden/common/platform/enums";
import { StateProvider } from "@bitwarden/common/platform/state";

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

  constructor(stateProvider: StateProvider) {
    super(stateProvider, DesktopThemingService.createSystemThemeObservable());
  }
}
