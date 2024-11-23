import { TestBed } from "@angular/core/testing";
import { mock, MockProxy } from "jest-mock-extended";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { SsoLoginServiceAbstraction } from "@bitwarden/common/auth/abstractions/sso-login.service.abstraction";
import { ClientType } from "@bitwarden/common/enums";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ToastService } from "@bitwarden/components";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/generator-legacy";

import { WebSsoComponentService } from "./web-sso-component.service";

describe("WebSsoComponentService", () => {
  let service: WebSsoComponentService;
  let i18nService: MockProxy<I18nService>;
  let apiService: MockProxy<ApiService>;
  let environmentService: MockProxy<EnvironmentService>;
  let passwordGenerationService: MockProxy<PasswordGenerationServiceAbstraction>;
  let cryptoFunctionService: MockProxy<CryptoFunctionService>;
  let platformUtilsService: MockProxy<PlatformUtilsService>;
  let toastService: MockProxy<ToastService>;
  let ssoLoginService: MockProxy<SsoLoginServiceAbstraction>;

  beforeEach(() => {
    i18nService = mock<I18nService>();
    apiService = mock<ApiService>();
    environmentService = mock<EnvironmentService>();
    passwordGenerationService = mock<PasswordGenerationServiceAbstraction>();
    cryptoFunctionService = mock<CryptoFunctionService>();
    platformUtilsService = mock<PlatformUtilsService>();
    toastService = mock<ToastService>();
    ssoLoginService = mock<SsoLoginServiceAbstraction>();
    TestBed.configureTestingModule({
      providers: [
        WebSsoComponentService,
        { provide: I18nService, useValue: i18nService },
        { provide: ApiService, useValue: apiService },
        { provide: EnvironmentService, useValue: environmentService },
        { provide: PasswordGenerationServiceAbstraction, useValue: passwordGenerationService },
        { provide: CryptoFunctionService, useValue: cryptoFunctionService },
        { provide: PlatformUtilsService, useValue: platformUtilsService },
        { provide: ToastService, useValue: toastService },
        { provide: SsoLoginServiceAbstraction, useValue: ssoLoginService },
      ],
    });

    service = TestBed.inject(WebSsoComponentService);
  });

  it("sets clientId to web", () => {
    expect(service.clientId).toBe(ClientType.Web);
  });

  describe("setDocumentCookies", () => {
    it("sets ssoHandOffMessage cookie with translated message", () => {
      const mockMessage = "Test SSO Message";
      i18nService.t.mockReturnValue(mockMessage);

      service.setDocumentCookies();

      expect(document.cookie).toContain(`ssoHandOffMessage=${mockMessage}`);
      expect(i18nService.t).toHaveBeenCalledWith("ssoHandOff");
    });
  });
});
