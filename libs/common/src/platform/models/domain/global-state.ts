import { ThemeType } from "../../enums";

export class GlobalState {
  enableAlwaysOnTop?: boolean;
  installedVersion?: string;
  locale?: string;
  organizationInvitation?: any;
  rememberedEmail?: string;
  theme?: ThemeType = ThemeType.System;
  twoFactorToken?: string;
  disableFavicon?: boolean;
  biometricFingerprintValidated?: boolean;
  vaultTimeout?: number;
  vaultTimeoutAction?: string;
  loginRedirect?: any;
  mainWindowSize?: number;
  enableBrowserIntegration?: boolean;
  enableBrowserIntegrationFingerprint?: boolean;
  enableDuckDuckGoBrowserIntegration?: boolean;
  deepLinkRedirectUrl?: string;
}
