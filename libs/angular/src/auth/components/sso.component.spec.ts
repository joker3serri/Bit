import { Component } from "@angular/core";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { mock } from "jest-mock-extended";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { TwoFactorProviderType } from "@bitwarden/common/auth/enums/two-factor-provider-type";
import { AuthResult } from "@bitwarden/common/auth/models/domain/auth-result";
import { ForceResetPasswordReason } from "@bitwarden/common/auth/models/domain/force-reset-password-reason";
import { KeyConnectorUserDecryptionOption } from "@bitwarden/common/auth/models/domain/user-decryption-options/key-connector-user-decryption-option";
import { TrustedDeviceUserDecryptionOption } from "@bitwarden/common/auth/models/domain/user-decryption-options/trusted-device-user-decryption-option";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { CryptoFunctionService } from "@bitwarden/common/platform/abstractions/crypto-function.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { AccountDecryptionOptions } from "@bitwarden/common/platform/models/domain/account";
import { PasswordGenerationServiceAbstraction } from "@bitwarden/common/tools/generator/password";

import { SsoComponent } from "./sso.component";

export const mockAcctDecryptionOpts = {
  noMasterPassword: new AccountDecryptionOptions({
    hasMasterPassword: false,
    trustedDeviceOption: undefined,
    keyConnectorOption: undefined,
  }),
  withMasterPassword: new AccountDecryptionOptions({
    hasMasterPassword: true,
    trustedDeviceOption: undefined,
    keyConnectorOption: undefined,
  }),
  withMasterPasswordAndTrustedDevice: new AccountDecryptionOptions({
    hasMasterPassword: true,
    trustedDeviceOption: new TrustedDeviceUserDecryptionOption(true, false, false),
    keyConnectorOption: undefined,
  }),
  withMasterPasswordAndTrustedDeviceWithManageResetPassword: new AccountDecryptionOptions({
    hasMasterPassword: true,
    trustedDeviceOption: new TrustedDeviceUserDecryptionOption(true, false, true),
    keyConnectorOption: undefined,
  }),
  withMasterPasswordAndKeyConnector: new AccountDecryptionOptions({
    hasMasterPassword: true,
    trustedDeviceOption: undefined,
    keyConnectorOption: new KeyConnectorUserDecryptionOption("http://example.com"),
  }),
  noMasterPasswordWithTrustedDevice: new AccountDecryptionOptions({
    hasMasterPassword: false,
    trustedDeviceOption: new TrustedDeviceUserDecryptionOption(true, false, false),
    keyConnectorOption: undefined,
  }),
  noMasterPasswordWithTrustedDeviceWithManageResetPassword: new AccountDecryptionOptions({
    hasMasterPassword: false,
    trustedDeviceOption: new TrustedDeviceUserDecryptionOption(true, false, true),
    keyConnectorOption: undefined,
  }),
  noMasterPasswordWithKeyConnector: new AccountDecryptionOptions({
    hasMasterPassword: false,
    trustedDeviceOption: undefined,
    keyConnectorOption: new KeyConnectorUserDecryptionOption("http://example.com"),
  }),
};

// test component that extends the SsoComponent
@Component({})
class TestSsoComponent extends SsoComponent {}

interface SsoComponentProtected {
  twoFactorRoute: string;
  successRoute: string;
  trustedDeviceEncRoute: string;
  changePasswordRoute: string;
  forcePasswordResetRoute: string;
  logIn(code: string, codeVerifier: string, orgIdFromState: string): Promise<AuthResult>;
  handleLoginError(e: any): Promise<void>;
}

// The ideal scenario would be to not have to test the protected / private methods of the SsoComponent
// but that will require a refactor of the SsoComponent class is out of scope for now.
// This test suite allows us to be sure that the new Trusted Device encryption flows + mild refactors
// of the SsoComponent don't break the existing post login flows.
describe("SsoComponent", () => {
  let component: TestSsoComponent;
  let _component: SsoComponentProtected;
  let fixture: ComponentFixture<TestSsoComponent>;

  // Mock Services
  const mockAuthService = mock<AuthService>();
  const mockRouter = mock<Router>();
  const mockI18nService = mock<I18nService>();
  const mockActivatedRoute = mock<ActivatedRoute>();
  const mockStateService = mock<StateService>();
  const mockPlatformUtilsService = mock<PlatformUtilsService>();
  const mockApiService = mock<ApiService>();
  const mockCryptoFunctionService = mock<CryptoFunctionService>();
  const mockEnvironmentService = mock<EnvironmentService>();
  const mockPasswordGenerationService = mock<PasswordGenerationServiceAbstraction>();
  const mockLogService = mock<LogService>();
  const mockConfigService = mock<ConfigServiceAbstraction>();

  // Mock authService.logIn params
  const code = "code";
  const codeVerifier = "codeVerifier";
  const orgIdFromState = "orgIdFromState";

  // Mock component callbacks
  let mockOnSuccessfulLogin = jest.fn();
  let mockOnSuccessfulLoginNavigate = jest.fn();
  let mockOnSuccessfulLoginTwoFactorNavigate = jest.fn();
  let mockOnSuccessfulLoginChangePasswordNavigate = jest.fn();
  let mockOnSuccessfulLoginForceResetNavigate = jest.fn();

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [TestSsoComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter },
        { provide: I18nService, useValue: mockI18nService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
        { provide: StateService, useValue: mockStateService },
        { provide: PlatformUtilsService, useValue: mockPlatformUtilsService },

        { provide: ApiService, useValue: mockApiService },
        { provide: CryptoFunctionService, useValue: mockCryptoFunctionService },
        { provide: EnvironmentService, useValue: mockEnvironmentService },
        { provide: PasswordGenerationServiceAbstraction, useValue: mockPasswordGenerationService },

        { provide: LogService, useValue: mockLogService },
        { provide: ConfigServiceAbstraction, useValue: mockConfigService },
      ],
    });

    fixture = TestBed.createComponent(TestSsoComponent);
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

  describe("navigateViaCallbackOrRoute(...)", () => {
    it("calls the provided callback when callback is defined", async () => {
      const callback = jest.fn().mockResolvedValue(null);
      const commands = ["some", "route"];

      await (component as any).navigateViaCallbackOrRoute(callback, commands);

      expect(callback).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });

    it("calls router.navigate when callback is not defined", async () => {
      const commands = ["some", "route"];

      await (component as any).navigateViaCallbackOrRoute(undefined, commands);

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith(commands, undefined);
    });
  });

  describe("logIn(...)", () => {
    describe("2FA scenarios", () => {
      beforeEach(() => {
        const authResult = new AuthResult();
        authResult.twoFactorProviders = new Map([[TwoFactorProviderType.Authenticator, {}]]);

        // use standard user with MP because this test is not concerned with password reset.
        mockStateService.getAccountDecryptionOptions.mockResolvedValue(
          mockAcctDecryptionOpts.withMasterPassword
        );

        mockAuthService.logIn.mockResolvedValue(authResult);
      });

      it("calls authService.logIn and navigates to the component's defined 2FA route when the auth result requires 2FA and onSuccessfulLoginTwoFactorNavigate is not defined", async () => {
        await _component.logIn(code, codeVerifier, orgIdFromState);
        expect(mockAuthService.logIn).toHaveBeenCalledTimes(1);

        expect(mockOnSuccessfulLoginTwoFactorNavigate).not.toHaveBeenCalled();

        expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
        expect(mockRouter.navigate).toHaveBeenCalledWith([_component.twoFactorRoute], {
          queryParams: {
            identifier: orgIdFromState,
            sso: "true",
          },
        });

        expect(mockLogService.error).not.toHaveBeenCalled();
      });

      it("calls onSuccessfulLoginTwoFactorNavigate instead of router.navigate when response.requiresTwoFactor is true and the callback is defined", async () => {
        mockOnSuccessfulLoginTwoFactorNavigate = jest.fn().mockResolvedValue(null);
        component.onSuccessfulLoginTwoFactorNavigate = mockOnSuccessfulLoginTwoFactorNavigate;

        await _component.logIn(code, codeVerifier, orgIdFromState);

        expect(mockAuthService.logIn).toHaveBeenCalledTimes(1);
        expect(mockOnSuccessfulLoginTwoFactorNavigate).toHaveBeenCalledTimes(1);
        expect(mockRouter.navigate).not.toHaveBeenCalled();
        expect(mockLogService.error).not.toHaveBeenCalled();
      });
    });

    const testChangePasswordOnSuccessfulLogin = async () => {
      await _component.logIn(code, codeVerifier, orgIdFromState);
      expect(mockAuthService.logIn).toHaveBeenCalledTimes(1);

      expect(mockOnSuccessfulLoginChangePasswordNavigate).not.toHaveBeenCalled();

      expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).toHaveBeenCalledWith([_component.changePasswordRoute], {
        queryParams: {
          identifier: orgIdFromState,
        },
      });

      expect(mockLogService.error).not.toHaveBeenCalled();
    };

    const testOnSuccessfulLoginChangePasswordNavigateOnSuccessfulLogin = async () => {
      mockOnSuccessfulLoginChangePasswordNavigate = jest.fn().mockResolvedValue(null);
      component.onSuccessfulLoginChangePasswordNavigate =
        mockOnSuccessfulLoginChangePasswordNavigate;

      await _component.logIn(code, codeVerifier, orgIdFromState);

      expect(mockAuthService.logIn).toHaveBeenCalledTimes(1);
      expect(mockOnSuccessfulLoginChangePasswordNavigate).toHaveBeenCalledTimes(1);
      expect(mockRouter.navigate).not.toHaveBeenCalled();
      expect(mockLogService.error).not.toHaveBeenCalled();
    };

    describe("Trusted Device Encryption scenarios", () => {
      beforeEach(() => {
        mockConfigService.getFeatureFlagBool.mockResolvedValue(true); // TDE enabled
      });

      describe("Given Trusted Device Encryption is enabled and user needs to set a master password", () => {
        let authResult;
        beforeEach(() => {
          mockStateService.getAccountDecryptionOptions.mockResolvedValue(
            mockAcctDecryptionOpts.noMasterPasswordWithTrustedDeviceWithManageResetPassword
          );

          authResult = new AuthResult();
          mockAuthService.logIn.mockResolvedValue(authResult);
        });

        it("navigates to the component's defined change password route when the login is successful", async () => {
          await testChangePasswordOnSuccessfulLogin();
        });

        it("calls onSuccessfulLoginChangePasswordNavigate instead of router.navigate when the callback is defined", async () => {
          await testOnSuccessfulLoginChangePasswordNavigateOnSuccessfulLogin();
        });
      });

      describe("Given Trusted Device Encryption is enabled, user doesn't need to set a MP, and forcePasswordReset is required", () => {
        let authResult;
        beforeEach(() => {
          mockStateService.getAccountDecryptionOptions.mockResolvedValue(
            mockAcctDecryptionOpts.withMasterPasswordAndTrustedDevice
          );

          authResult = new AuthResult();
          authResult.forcePasswordReset = ForceResetPasswordReason.AdminForcePasswordReset;
          mockAuthService.logIn.mockResolvedValue(authResult);
        });

        it("navigates to the component's defined force password reset route when login is successful", async () => {
          await _component.logIn(code, codeVerifier, orgIdFromState);

          expect(mockAuthService.logIn).toHaveBeenCalledTimes(1);
          expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
          expect(mockRouter.navigate).toHaveBeenCalledWith([_component.forcePasswordResetRoute], {
            queryParams: {
              identifier: orgIdFromState,
            },
          });
          expect(mockLogService.error).not.toHaveBeenCalled();
        });
      });

      describe("Given Trusted Device Encryption is enabled, user doesn't need to set a MP, and forcePasswordReset is not required", () => {
        let authResult;
        beforeEach(() => {
          mockStateService.getAccountDecryptionOptions.mockResolvedValue(
            mockAcctDecryptionOpts.withMasterPasswordAndTrustedDevice
          );

          authResult = new AuthResult();
          authResult.forcePasswordReset = ForceResetPasswordReason.None;
          mockAuthService.logIn.mockResolvedValue(authResult);
        });

        it("navigates to the component's defined trusted device encryption route when login is successful", async () => {
          await _component.logIn(code, codeVerifier, orgIdFromState);

          expect(mockAuthService.logIn).toHaveBeenCalledTimes(1);
          expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
          expect(mockRouter.navigate).toHaveBeenCalledWith([_component.trustedDeviceEncRoute], {
            queryParams: {
              identifier: orgIdFromState,
            },
          });
          expect(mockLogService.error).not.toHaveBeenCalled();
        });
      });
    });
    describe("Reset Master Password scenarios", () => {
      beforeEach(() => {
        const authResult = new AuthResult();
        mockAuthService.logIn.mockResolvedValue(authResult);
      });

      it("calls authService.logIn and navigates to the component's defined change password route when the response requires a password reset", async () => {
        // Only need to test the case where the user has no master password to test the primary change mp flow here
        mockStateService.getAccountDecryptionOptions.mockResolvedValue(
          mockAcctDecryptionOpts.noMasterPassword
        );
        await testChangePasswordOnSuccessfulLogin();
      });

      it("calls onSuccessfulLoginChangePasswordNavigate instead of router.navigate when response.resetMasterPassword is true and the callback is defined", async () => {
        // Only need to test the case where the user has no master password to test the primary change mp flow here
        mockStateService.getAccountDecryptionOptions.mockResolvedValue(
          mockAcctDecryptionOpts.noMasterPassword
        );
        await testOnSuccessfulLoginChangePasswordNavigateOnSuccessfulLogin();
      });

      it("calls authService.logIn and does not navigate to the change password route when the user has key connector even if user has no master password", async () => {
        mockStateService.getAccountDecryptionOptions.mockResolvedValue(
          mockAcctDecryptionOpts.noMasterPasswordWithKeyConnector
        );

        await _component.logIn(code, codeVerifier, orgIdFromState);
        expect(mockAuthService.logIn).toHaveBeenCalledTimes(1);

        expect(mockOnSuccessfulLoginChangePasswordNavigate).not.toHaveBeenCalled();
        expect(mockRouter.navigate).not.toHaveBeenCalledWith([_component.changePasswordRoute], {
          queryParams: {
            identifier: orgIdFromState,
          },
        });
      });
    });

    describe("Force Master Password Reset scenarios", () => {
      [
        ForceResetPasswordReason.AdminForcePasswordReset,
        ForceResetPasswordReason.WeakMasterPassword,
      ].forEach((forceResetPasswordReason) => {
        const reasonString = ForceResetPasswordReason[forceResetPasswordReason];

        beforeEach(() => {
          // use standard user with MP because this test is not concerned with password reset.
          mockStateService.getAccountDecryptionOptions.mockResolvedValue(
            mockAcctDecryptionOpts.withMasterPassword
          );
        });

        it(`calls authService.logIn and navigates to the component's defined update temp password route when response.forcePasswordReset is ${reasonString}`, async () => {
          const authResult = new AuthResult();
          authResult.forcePasswordReset = forceResetPasswordReason;
          mockAuthService.logIn.mockResolvedValue(authResult);

          await _component.logIn(code, codeVerifier, orgIdFromState);

          expect(mockAuthService.logIn).toHaveBeenCalledTimes(1);

          expect(mockOnSuccessfulLoginForceResetNavigate).not.toHaveBeenCalled();

          expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
          expect(mockRouter.navigate).toHaveBeenCalledWith([_component.forcePasswordResetRoute], {
            queryParams: {
              identifier: orgIdFromState,
            },
          });

          expect(mockLogService.error).not.toHaveBeenCalled();
        });

        it(`calls onSuccessfulLoginForceResetNavigate instead of router.navigate when response.forcePasswordReset is ${reasonString} and the callback is defined`, async () => {
          const authResult = new AuthResult();
          authResult.forcePasswordReset = forceResetPasswordReason;
          mockAuthService.logIn.mockResolvedValue(authResult);

          mockOnSuccessfulLoginForceResetNavigate = jest.fn().mockResolvedValue(null);
          component.onSuccessfulLoginForceResetNavigate = mockOnSuccessfulLoginForceResetNavigate;

          await _component.logIn(code, codeVerifier, orgIdFromState);

          expect(mockAuthService.logIn).toHaveBeenCalledTimes(1);
          expect(mockOnSuccessfulLoginForceResetNavigate).toHaveBeenCalledTimes(1);
          expect(mockRouter.navigate).not.toHaveBeenCalled();
          expect(mockLogService.error).not.toHaveBeenCalled();
        });
      });
    });

    describe("Success scenarios", () => {
      beforeEach(() => {
        const authResult = new AuthResult();
        authResult.twoFactorProviders = null;
        // use standard user with MP because this test is not concerned with password reset.
        mockStateService.getAccountDecryptionOptions.mockResolvedValue(
          mockAcctDecryptionOpts.withMasterPassword
        );
        authResult.forcePasswordReset = ForceResetPasswordReason.None;
        mockAuthService.logIn.mockResolvedValue(authResult);
      });

      it("calls authService.logIn and navigates to the component's defined success route when the login is successful", async () => {
        await _component.logIn(code, codeVerifier, orgIdFromState);

        expect(mockAuthService.logIn).toHaveBeenCalled();

        expect(mockOnSuccessfulLoginNavigate).not.toHaveBeenCalled();
        expect(mockOnSuccessfulLogin).not.toHaveBeenCalled();

        expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
        expect(mockRouter.navigate).toHaveBeenCalledWith([_component.successRoute], undefined);
        expect(mockLogService.error).not.toHaveBeenCalled();
      });

      it("calls onSuccessfulLogin if defined when login is successful", async () => {
        mockOnSuccessfulLogin = jest.fn().mockResolvedValue(null);
        component.onSuccessfulLogin = mockOnSuccessfulLogin;

        await _component.logIn(code, codeVerifier, orgIdFromState);

        expect(mockAuthService.logIn).toHaveBeenCalled();
        expect(mockOnSuccessfulLogin).toHaveBeenCalledTimes(1);

        expect(mockOnSuccessfulLoginNavigate).not.toHaveBeenCalled();

        expect(mockRouter.navigate).toHaveBeenCalledTimes(1);
        expect(mockRouter.navigate).toHaveBeenCalledWith([_component.successRoute], undefined);

        expect(mockLogService.error).not.toHaveBeenCalled();
      });

      it("calls onSuccessfulLoginNavigate instead of router.navigate when login is successful and the callback is defined", async () => {
        mockOnSuccessfulLoginNavigate = jest.fn().mockResolvedValue(null);
        component.onSuccessfulLoginNavigate = mockOnSuccessfulLoginNavigate;

        await _component.logIn(code, codeVerifier, orgIdFromState);

        expect(mockAuthService.logIn).toHaveBeenCalled();

        expect(mockOnSuccessfulLoginNavigate).toHaveBeenCalledTimes(1);

        expect(mockRouter.navigate).not.toHaveBeenCalled();

        expect(mockLogService.error).not.toHaveBeenCalled();
      });
    });

    describe("Error scenarios", () => {
      it("calls handleLoginError when an error is thrown during logIn", async () => {
        const errorMessage = "Key Connector error";
        const error = new Error(errorMessage);
        mockAuthService.logIn.mockRejectedValue(error);

        const handleLoginErrorSpy = jest.spyOn(_component, "handleLoginError");

        await _component.logIn(code, codeVerifier, orgIdFromState);

        expect(handleLoginErrorSpy).toHaveBeenCalledWith(error);
      });
    });
  });

  describe("handleLoginError(e)", () => {
    it("logs the error and shows a toast when the error message is 'Key Connector error'", async () => {
      const errorMessage = "Key Connector error";
      const error = new Error(errorMessage);

      mockI18nService.t.mockReturnValueOnce("ssoKeyConnectorError");

      await _component.handleLoginError(error);

      expect(mockLogService.error).toHaveBeenCalledTimes(1);
      expect(mockLogService.error).toHaveBeenCalledWith(error);

      expect(mockPlatformUtilsService.showToast).toHaveBeenCalledTimes(1);
      expect(mockPlatformUtilsService.showToast).toHaveBeenCalledWith(
        "error",
        null,
        "ssoKeyConnectorError"
      );

      expect(mockRouter.navigate).not.toHaveBeenCalled();
    });
  });
});
