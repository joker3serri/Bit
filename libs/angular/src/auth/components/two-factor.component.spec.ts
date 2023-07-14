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

describe("TwoFactorComponent", () => {
  let component: TestTwoFactorComponent;
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
  });

  afterEach(() => {
    // Reset all mocks after each test
    jest.resetAllMocks();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  // Add more tests here...
});
