import { WindowState } from "../../../models/domain/window-state";

export class GlobalState {
  enableAlwaysOnTop?: boolean;
  organizationInvitation?: any;
  rememberedEmail?: string;
  window?: WindowState = new WindowState();
  disableFavicon?: boolean;
  biometricFingerprintValidated?: boolean;
  vaultTimeout?: number;
  vaultTimeoutAction?: string;
  enableTray?: boolean;
  enableMinimizeToTray?: boolean;
  enableCloseToTray?: boolean;
  enableStartToTray?: boolean;
  openAtLogin?: boolean;
  alwaysShowDock?: boolean;
  enableBrowserIntegration?: boolean;
  enableBrowserIntegrationFingerprint?: boolean;
  enableDuckDuckGoBrowserIntegration?: boolean;
  deepLinkRedirectUrl?: string;
}
