import { ThemeType } from "../../enums";

export class GlobalState {
  installedVersion?: string;
  locale?: string;
  organizationInvitation?: any;
  ssoCodeVerifier?: string;
  ssoOrganizationIdentifier?: string;
  ssoState?: string;
  rememberedEmail?: string;
  theme?: ThemeType = ThemeType.System;
  twoFactorToken?: string;
  disableFavicon?: boolean;
  biometricAwaitingAcceptance?: boolean;
  biometricFingerprintValidated?: boolean;
  vaultTimeout?: number;
  vaultTimeoutAction?: string;
  loginRedirect?: any;
  mainWindowSize?: number;
  enableBiometrics?: boolean;
  biometricText?: string;
  noAutoPromptBiometricsText?: string;
  enableBrowserIntegration?: boolean;
  enableBrowserIntegrationFingerprint?: boolean;
  enableDuckDuckGoBrowserIntegration?: boolean;
  neverDomains?: { [id: string]: unknown };
  enablePasskeys?: boolean;
  disableAddLoginNotification?: boolean;
  disableChangedPasswordNotification?: boolean;
  disableContextMenuItem?: boolean;
  autoFillOverlayVisibility?: number;
  deepLinkRedirectUrl?: string;
}
