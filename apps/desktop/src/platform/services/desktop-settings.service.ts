import { Observable, combineLatest, map } from "rxjs";

import {
  ActiveUserState,
  DESKTOP_SETTINGS_DISK,
  GlobalState,
  KeyDefinition,
  StateProvider,
} from "@bitwarden/common/platform/state";

import { WindowState } from "../models/domain/window-state";

const WINDOW_KEY = new KeyDefinition<WindowState | null>(DESKTOP_SETTINGS_DISK, "window", {
  deserializer: (s) => s,
});

const ALWAYS_ON_TOP_KEY = new KeyDefinition<boolean>(DESKTOP_SETTINGS_DISK, "alwaysOnTop", {
  deserializer: (b) => b,
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
  private windowState: GlobalState<WindowState>;

  // TODO: Active user state for this as well
  private alwaysOnTopGlobalState: GlobalState<boolean>;
  private alwaysOnTopUserState: ActiveUserState<boolean>;
  private closeToTrayState: GlobalState<boolean>;
  private minimizeToTrayState: GlobalState<boolean>;
  private startToTrayState: GlobalState<boolean>;
  private trayEnabledState: GlobalState<boolean>;
  private openAtLoginState: GlobalState<boolean>;
  private alwaysShowDockState: GlobalState<boolean>;

  constructor(private stateProvider: StateProvider) {
    this.windowState = this.stateProvider.getGlobal(WINDOW_KEY);
    this.alwaysOnTopGlobalState = this.stateProvider.getGlobal(ALWAYS_ON_TOP_KEY);
    this.alwaysOnTopUserState = this.stateProvider.getActive(ALWAYS_ON_TOP_KEY);
    this.closeToTrayState = this.stateProvider.getGlobal(CLOSE_TO_TRAY_KEY);
    this.minimizeToTrayState = this.stateProvider.getGlobal(MINIMIZE_TO_TRAY_KEY);
    this.startToTrayState = this.stateProvider.getGlobal(START_TO_TRAY_KEY);
    this.trayEnabledState = this.stateProvider.getGlobal(TRAY_ENABLED_KEY);
    this.openAtLoginState = this.stateProvider.getGlobal(OPEN_AT_LOGIN_KEY);
    this.alwaysShowDockState = this.stateProvider.getGlobal(ALWAYS_SHOW_DOCK_KEY);

    this.window$ = this.windowState.state$;

    this.alwaysOnTop$ = combineLatest([
      this.alwaysOnTopUserState.state$,
      this.alwaysOnTopGlobalState.state$,
    ]).pipe(
      map(([userPreference, globalPreference]) => {
        return userPreference ?? globalPreference ?? false;
      }),
    );

    this.closeToTray$ = this.closeToTrayState.state$.pipe(map((value) => value ?? false));
    this.minimizeToTray$ = this.minimizeToTrayState.state$.pipe(map((value) => value ?? false));
    this.startToTray$ = this.startToTrayState.state$.pipe(map((value) => value ?? false));
    this.trayEnabled$ = this.trayEnabledState.state$.pipe(map((value) => value ?? false));
    this.openAtLogin$ = this.openAtLoginState.state$.pipe(map((value) => value ?? false));
    this.alwaysShowDock$ = this.alwaysShowDockState.state$.pipe(map((value) => value ?? false));
  }

  window$: Observable<WindowState>;

  async setWindow(windowState: WindowState) {
    await this.windowState.update(() => windowState);
  }

  alwaysOnTop$: Observable<boolean>;

  async setAlwaysOnTop(value: boolean) {
    await this.alwaysOnTopUserState.update(() => value);
    await this.alwaysOnTopGlobalState.update(() => value);
  }

  closeToTray$: Observable<boolean>;

  async setCloseToTray(value: boolean) {
    await this.closeToTrayState.update(() => value);
  }

  minimizeToTray$: Observable<boolean>;

  async setMinimizeToTray(value: boolean) {
    await this.minimizeToTrayState.update(() => value);
  }

  startToTray$: Observable<boolean>;

  async setStartToTray(value: boolean) {
    await this.startToTrayState.update(() => value);
  }

  trayEnabled$: Observable<boolean>;

  async setTrayEnabled(value: boolean) {
    await this.trayEnabledState.update(() => value);
  }

  openAtLogin$: Observable<boolean>;

  async setOpenAtLogin(value: boolean) {
    await this.openAtLoginState.update(() => value);
  }

  alwaysShowDock$: Observable<boolean>;

  async setAlwaysShowDock(value: boolean) {
    await this.alwaysShowDockState.update(() => value);
  }
}
