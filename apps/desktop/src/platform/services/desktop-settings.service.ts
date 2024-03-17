import { Observable, map } from "rxjs";

import {
  DESKTOP_SETTINGS_DISK,
  KeyDefinition,
  StateProvider,
} from "@bitwarden/common/platform/state";

import { WindowState } from "../models/domain/window-state";

const WINDOW_KEY = new KeyDefinition<WindowState | null>(DESKTOP_SETTINGS_DISK, "window", {
  deserializer: (s) => s,
});

const CLOSE_TO_TRAY_KEY = new KeyDefinition<boolean>(DESKTOP_SETTINGS_DISK, "closeToTray", {
  deserializer: (b) => b,
});

const MINIMIZE_TO_TRAY_KEY = new KeyDefinition<boolean>(DESKTOP_SETTINGS_DISK, "minimizeToTray", {
  deserializer: (b) => b,
});

const START_TO_TRAY_KEY = new KeyDefinition<boolean>(DESKTOP_SETTINGS_DISK, "startToTray", {
  deserializer: (b) => b,
});

const TRAY_ENABLED_KEY = new KeyDefinition<boolean>(DESKTOP_SETTINGS_DISK, "trayEnabled", {
  deserializer: (b) => b,
});

const OPEN_AT_LOGIN_KEY = new KeyDefinition<boolean>(DESKTOP_SETTINGS_DISK, "openAtLogin", {
  deserializer: (b) => b,
});

const ALWAYS_SHOW_DOCK_KEY = new KeyDefinition<boolean>(DESKTOP_SETTINGS_DISK, "alwaysShowDock", {
  deserializer: (b) => b,
});

export class DesktopSettingsService {
  private readonly windowState = this.stateProvider.getGlobal(WINDOW_KEY);

  private readonly closeToTrayState = this.stateProvider.getGlobal(CLOSE_TO_TRAY_KEY);
  /**
   *
   */
  closeToTray$ = this.closeToTrayState.state$.pipe(map((value) => value ?? false));

  private readonly minimizeToTrayState = this.stateProvider.getGlobal(MINIMIZE_TO_TRAY_KEY);
  /**
   *
   */
  minimizeToTray$ = this.minimizeToTrayState.state$.pipe(map((value) => value ?? false));

  private readonly startToTrayState = this.stateProvider.getGlobal(START_TO_TRAY_KEY);
  /**
   *
   */
  startToTray$ = this.startToTrayState.state$.pipe(map((value) => value ?? false));

  private readonly trayEnabledState = this.stateProvider.getGlobal(TRAY_ENABLED_KEY);
  /**
   *
   */
  trayEnabled$ = this.trayEnabledState.state$.pipe(map((value) => value ?? false));

  private readonly openAtLoginState = this.stateProvider.getGlobal(OPEN_AT_LOGIN_KEY);
  /**
   *
   */
  openAtLogin$ = this.openAtLoginState.state$.pipe(map((value) => value ?? false));

  private readonly alwaysShowDockState = this.stateProvider.getGlobal(ALWAYS_SHOW_DOCK_KEY);
  /**
   *
   */
  alwaysShowDock$ = this.alwaysShowDockState.state$.pipe(map((value) => value ?? false));

  constructor(private stateProvider: StateProvider) {
    this.window$ = this.windowState.state$.pipe(
      map((window) =>
        window != null && Object.keys(window).length > 0 ? window : new WindowState(),
      ),
    );
  }

  /**
   *
   */
  window$: Observable<WindowState>;

  /**
   *
   * @param windowState
   */
  async setWindow(windowState: WindowState) {
    await this.windowState.update(() => windowState);
  }

  /**
   *
   */
  alwaysOnTop$: Observable<boolean>;

  /**
   *
   * @param value
   */
  async setCloseToTray(value: boolean) {
    await this.closeToTrayState.update(() => value);
  }

  /**
   *
   * @param value
   */
  async setMinimizeToTray(value: boolean) {
    await this.minimizeToTrayState.update(() => value);
  }

  /**
   *
   * @param value
   */
  async setStartToTray(value: boolean) {
    await this.startToTrayState.update(() => value);
  }

  /**
   *
   * @param value
   */
  async setTrayEnabled(value: boolean) {
    await this.trayEnabledState.update(() => value);
  }

  /**
   *
   * @param value
   */
  async setOpenAtLogin(value: boolean) {
    await this.openAtLoginState.update(() => value);
  }

  /**
   *
   * @param value
   */
  async setAlwaysShowDock(value: boolean) {
    await this.alwaysShowDockState.update(() => value);
  }
}
