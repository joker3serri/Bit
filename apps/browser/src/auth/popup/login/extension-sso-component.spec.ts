import { TestBed } from "@angular/core/testing";
import { mock, MockProxy } from "jest-mock-extended";
import { BehaviorSubject } from "rxjs";

import { WINDOW } from "@bitwarden/angular/services/injection-tokens";
import { SsoClientId } from "@bitwarden/auth/angular";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { AuthenticationStatus } from "@bitwarden/common/auth/enums/authentication-status";
import {
  EnvironmentService,
  Environment,
} from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";

import { BrowserApi } from "../../../platform/browser/browser-api";

import { ExtensionSsoComponentService } from "./extension-sso-component.service";

describe("ExtensionSsoComponentService", () => {
  let service: ExtensionSsoComponentService;
  const baseUrl = "https://vault.bitwarden.com";

  let syncService: MockProxy<SyncService>;
  let authService: MockProxy<AuthService>;
  let environmentService: MockProxy<EnvironmentService>;
  let i18nService: MockProxy<I18nService>;
  let windowMock: MockProxy<Window>;

  beforeEach(() => {
    syncService = mock<SyncService>();
    authService = mock<AuthService>();
    environmentService = mock<EnvironmentService>();
    i18nService = mock<I18nService>();
    windowMock = mock<Window>();

    environmentService.environment$ = new BehaviorSubject<Environment>({
      getWebVaultUrl: () => baseUrl,
    } as Environment);

    TestBed.configureTestingModule({
      providers: [
        ExtensionSsoComponentService,
        { provide: SyncService, useValue: syncService },
        { provide: AuthService, useValue: authService },
        { provide: EnvironmentService, useValue: environmentService },
        { provide: I18nService, useValue: i18nService },
        { provide: WINDOW, useValue: windowMock },
      ],
    });

    service = TestBed.inject(ExtensionSsoComponentService);

    jest.spyOn(BrowserApi, "reloadOpenWindows").mockImplementation();
  });

  it("sets clientId to browser", () => {
    expect(service.clientId).toBe(SsoClientId.Browser);
  });

  it("sets redirectUri based on environment", () => {
    expect(service.redirectUri).toBe(`${baseUrl}/sso-connector.html`);
  });

  describe("onSuccessfulLogin", () => {
    beforeEach(() => {
      jest.clearAllMocks();
    });

    it("performs full sync", async () => {
      authService.getAuthStatus.mockResolvedValue(AuthenticationStatus.LoggedOut);

      await service.onSuccessfulLogin();

      expect(syncService.fullSync).toHaveBeenCalledWith(true);
    });

    it("reloads windows when vault is locked", async () => {
      authService.getAuthStatus.mockResolvedValue(AuthenticationStatus.Locked);

      await service.onSuccessfulLogin();

      expect(BrowserApi.reloadOpenWindows).toHaveBeenCalled();
    });

    it("does not reload windows when vault is unlocked", async () => {
      authService.getAuthStatus.mockResolvedValue(AuthenticationStatus.Unlocked);

      await service.onSuccessfulLogin();

      expect(BrowserApi.reloadOpenWindows).not.toHaveBeenCalled();
    });

    it("closes window", async () => {
      authService.getAuthStatus.mockResolvedValue(AuthenticationStatus.LoggedOut);

      await service.onSuccessfulLogin();

      expect(windowMock.close).toHaveBeenCalled();
    });
  });

  describe("onSuccessfulLoginTde", () => {
    it("performs full sync", async () => {
      await service.onSuccessfulLoginTde();

      expect(syncService.fullSync).toHaveBeenCalledWith(true);
    });
  });

  describe("onSuccessfulLoginTdeNavigate", () => {
    it("closes window", async () => {
      await service.onSuccessfulLoginTdeNavigate();

      expect(windowMock.close).toHaveBeenCalled();
    });
  });
});
