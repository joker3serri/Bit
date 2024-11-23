import { TestBed } from "@angular/core/testing";
import { mock, MockProxy } from "jest-mock-extended";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { SsoLoginServiceAbstraction } from "@bitwarden/common/auth/abstractions/sso-login.service.abstraction";
import { ClientType } from "@bitwarden/common/enums";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { SyncService } from "@bitwarden/common/platform/sync";
import { ToastService } from "@bitwarden/components";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/generator-legacy";

import { DesktopSsoComponentService } from "./desktop-sso-component.service";

describe("DesktopSsoComponentService", () => {
  let service: DesktopSsoComponentService;
  let syncService: MockProxy<SyncService>;
  let logService: MockProxy<LogService>;
  let apiService: MockProxy<ApiService>;
  let environmentService: MockProxy<EnvironmentService>;
  let passwordGenerationService: MockProxy<PasswordGenerationServiceAbstraction>;
  let cryptoFunctionService: MockProxy<CryptoFunctionService>;
  let platformUtilsService: MockProxy<PlatformUtilsService>;
  let i18nService: MockProxy<I18nService>;
  let toastService: MockProxy<ToastService>;
  let ssoLoginService: MockProxy<SsoLoginServiceAbstraction>;

  beforeEach(() => {
    syncService = mock<SyncService>();
    logService = mock<LogService>();
    apiService = mock<ApiService>();
    environmentService = mock<EnvironmentService>();
    passwordGenerationService = mock<PasswordGenerationServiceAbstraction>();
    cryptoFunctionService = mock<CryptoFunctionService>();
    platformUtilsService = mock<PlatformUtilsService>();
    i18nService = mock<I18nService>();
    toastService = mock<ToastService>();
    ssoLoginService = mock<SsoLoginServiceAbstraction>();

    TestBed.configureTestingModule({
      providers: [
        DesktopSsoComponentService,
        { provide: SyncService, useValue: syncService },
        { provide: LogService, useValue: logService },
        { provide: ApiService, useValue: apiService },
        { provide: EnvironmentService, useValue: environmentService },
        { provide: PasswordGenerationServiceAbstraction, useValue: passwordGenerationService },
        { provide: CryptoFunctionService, useValue: cryptoFunctionService },
        { provide: PlatformUtilsService, useValue: platformUtilsService },
        { provide: I18nService, useValue: i18nService },
        { provide: ToastService, useValue: toastService },
        { provide: SsoLoginServiceAbstraction, useValue: ssoLoginService },
      ],
    });

    service = TestBed.inject(DesktopSsoComponentService);
  });

  it("sets clientId to desktop", () => {
    expect(service.clientId).toBe(ClientType.Desktop);
  });

  it("sets redirectUri to bitwarden://sso-callback", () => {
    expect(service.redirectUri).toBe("bitwarden://sso-callback");
  });

  describe("onSuccessfulLogin", () => {
    it("performs full sync", async () => {
      await service.onSuccessfulLogin();

      expect(syncService.fullSync).toHaveBeenCalledWith(true, true);
    });
  });

  describe("onSuccessfulLoginTde", () => {
    it("performs full sync", async () => {
      await service.onSuccessfulLoginTde();

      expect(syncService.fullSync).toHaveBeenCalledWith(true, true);
    });
  });
});
