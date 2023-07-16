import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { mock } from "jest-mock-extended";

// eslint-disable-next-line no-restricted-imports
import { WINDOW } from "@bitwarden/angular/services/injection-tokens";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { LoginService } from "@bitwarden/common/auth/abstractions/login.service";
import { TwoFactorService } from "@bitwarden/common/auth/abstractions/two-factor.service";
import { AuthResult } from "@bitwarden/common/auth/models/domain/auth-result";
import { TokenTwoFactorRequest } from "@bitwarden/common/auth/models/request/identity-token/token-two-factor.request";
import { AppIdService } from "@bitwarden/common/platform/abstractions/app-id.service";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";

import { TwoFactorComponent } from "./two-factor.component";

// test component that extends the TwoFactorComponent
@Component({})
class TestTwoFactorComponent extends TwoFactorComponent {}

interface TwoFactorComponentProtected {
  successRoute: string;
}

describe("TwoFactorComponent", () => {
  let component: TestTwoFactorComponent;
  let _component: TwoFactorComponentProtected;

  let fixture: ComponentFixture<TestTwoFactorComponent>;

  // Mock Services
  const mockAuthService = mock<AuthService>();
  const mockRouter = mock<Router>();
  const mockI18nService = mock<I18nService>();
  const mockApiService = mock<ApiService>();
  const mockPlatformUtilsService = mock<PlatformUtilsService>();
  const mockWin = mock<Window>();
  const mockEnvironmentService = mock<EnvironmentService>();
  const mockStateService = mock<StateService>();
  const mockActivatedRoute = mock<ActivatedRoute>();
  const mockLogService = mock<LogService>();
  const mockTwoFactorService = mock<TwoFactorService>();
  const mockAppIdService = mock<AppIdService>();
  const mockLoginService = mock<LoginService>();
  const mockConfigService = mock<ConfigServiceAbstraction>();

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestTwoFactorComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: I18nService, useValue: mockI18nService },
        { provide: ApiService, useValue: mockApiService },
        { provide: PlatformUtilsService, useValue: mockPlatformUtilsService },
        { provide: WINDOW, useValue: mockWin },
        { provide: EnvironmentService, useValue: mockEnvironmentService },
        { provide: StateService, useValue: mockStateService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: LogService, useValue: mockLogService },
        { provide: TwoFactorService, useValue: mockTwoFactorService },
        { provide: AppIdService, useValue: mockAppIdService },
        { provide: LoginService, useValue: mockLoginService },
        { provide: ConfigServiceAbstraction, useValue: mockConfigService },
      ],
    });

    fixture = TestBed.createComponent(TestTwoFactorComponent);
    component = fixture.componentInstance;
    _component = component as any;
  });

  afterEach(() => {
    // Reset all mocks after each test
    jest.resetAllMocks();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  describe("doSubmit", () => {
    const token = "testToken";
    const remember = false;
    const captchaToken = "testCaptchaToken";

    beforeEach(() => {
      component.token = token;
      component.remember = remember;
      component.captchaToken = captchaToken;
    });

    it("calls authService.logInTwoFactor with correct parameters when form is submitted", async () => {
      // Arrange
      mockAuthService.logInTwoFactor.mockResolvedValue(new AuthResult());
      // Act
      await component.doSubmit();
      // Assert
      expect(mockAuthService.logInTwoFactor).toHaveBeenCalledWith(
        new TokenTwoFactorRequest(component.selectedProviderType, token, remember),
        captchaToken
      );
    });

    it("should return when handleCaptchaRequired returns true", async () => {
      // Arrange
      const captchaSiteKey = "testCaptchaSiteKey";
      const authResult = new AuthResult();
      authResult.captchaSiteKey = captchaSiteKey;

      mockAuthService.logInTwoFactor.mockResolvedValue(authResult);

      // Note: the any casts are required b/c typescript cant recognize that
      // handleCaptureRequired is a method on TwoFactorComponent b/c it is inherited
      // from the CaptchaProtectedComponent
      const handleCaptchaRequiredSpy = jest
        .spyOn<any, any>(component, "handleCaptchaRequired")
        .mockReturnValue(true);

      // Act
      const result = await component.doSubmit();

      // Assert
      expect(handleCaptchaRequiredSpy).toHaveBeenCalled();
      expect(result).toBeUndefined();
    });

    it("calls onSuccessfulLogin when defined", async () => {
      // Arrange
      component.onSuccessfulLogin = jest.fn().mockResolvedValue(undefined);
      mockAuthService.logInTwoFactor.mockResolvedValue(new AuthResult());

      // Act
      await component.doSubmit();

      // Assert
      expect(component.onSuccessfulLogin).toHaveBeenCalled();
    });

    it("sets successRoute to 'set-password' when response.resetMasterPassword is true", async () => {
      // Arrange
      const authResult = new AuthResult();
      authResult.resetMasterPassword = true;

      mockAuthService.logInTwoFactor.mockResolvedValue(authResult);

      // Act
      await component.doSubmit();

      // Assert
      expect(_component.successRoute).toEqual("set-password");
    });

    it("calls onSuccessfulLoginNavigate when defined", async () => {
      // Arrange
      component.onSuccessfulLoginNavigate = jest.fn().mockResolvedValue(undefined);
      mockAuthService.logInTwoFactor.mockResolvedValue(new AuthResult());

      // Act
      await component.doSubmit();

      // Assert
      expect(component.onSuccessfulLoginNavigate).toHaveBeenCalled();
    });

    it("navigates to successRoute when onSuccessfulLoginNavigate is not defined", async () => {
      // Arrange
      mockAuthService.logInTwoFactor.mockResolvedValue(new AuthResult());
      const navigateSpy = jest.spyOn(mockRouter, "navigate");

      // Act
      await component.doSubmit();

      // Assert
      expect(navigateSpy).toHaveBeenCalledWith([_component.successRoute], {
        queryParams: {
          identifier: component.identifier,
        },
      });
    });
  });
});
