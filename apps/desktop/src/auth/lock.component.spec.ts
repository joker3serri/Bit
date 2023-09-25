import { NO_ERRORS_SCHEMA } from "@angular/core";
import { ComponentFixture, TestBed, fakeAsync, tick } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { LockComponent as BaseLockComponent } from "@bitwarden/angular/auth/components/lock.component";
import { I18nPipe } from "@bitwarden/angular/platform/pipes/i18n.pipe";
import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { VaultTimeoutSettingsService } from "@bitwarden/common/abstractions/vault-timeout/vault-timeout-settings.service";
import { VaultTimeoutService } from "@bitwarden/common/abstractions/vault-timeout/vault-timeout.service";
import { PolicyApiServiceAbstraction } from "@bitwarden/common/admin-console/abstractions/policy/policy-api.service.abstraction";
import { InternalPolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { DeviceTrustCryptoServiceAbstraction } from "@bitwarden/common/auth/abstractions/device-trust-crypto.service.abstraction";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { BroadcasterService } from "@bitwarden/common/platform/abstractions/broadcaster.service";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EnvironmentService } from "@bitwarden/common/platform/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { PasswordStrengthServiceAbstraction } from "@bitwarden/common/tools/password-strength";
import { DialogService } from "@bitwarden/components";

// eslint-disable-next-line no-restricted-imports
import { Substitute, SubstituteOf } from "@fluffy-spoon/substitute";

import { ipcRenderer } from "electron";
import { MockProxy, mock } from "jest-mock-extended";
import { of } from "rxjs";
import { ElectronStateService } from "../platform/services/electron-state.service.abstraction";
import { LockComponent } from "./lock.component";

jest.mock("electron", () => ({
  ipcRenderer: {
    invoke: jest.fn(),
  },
}));

describe("GeneratorComponent", () => {
  let component: LockComponent;
  let fixture: ComponentFixture<LockComponent>;
  let stateServiceSubstitute: SubstituteOf<ElectronStateService>;
  let messagingServiceMock: MockProxy<MessagingService>;
  let broadcasterServiceMock: MockProxy<BroadcasterService>;
  let platformUtilsServiceMock: MockProxy<PlatformUtilsService>;

  beforeEach(() => {
    stateServiceSubstitute = Substitute.for<ElectronStateService>();
    messagingServiceMock = mock<MessagingService>();
    broadcasterServiceMock = mock<BroadcasterService>();
    platformUtilsServiceMock = mock<PlatformUtilsService>();

    TestBed.configureTestingModule({
      declarations: [LockComponent, I18nPipe],
      providers: [
        {
          provide: I18nService,
          useClass: Substitute.for<I18nService>(),
        },
        {
          provide: PlatformUtilsService,
          useValue: platformUtilsServiceMock,
        },
        {
          provide: MessagingService,
          useValue: messagingServiceMock,
        },
        {
          provide: CryptoService,
          useClass: Substitute.for<CryptoService>(),
        },
        {
          provide: VaultTimeoutService,
          useClass: Substitute.for<VaultTimeoutService>(),
        },
        {
          provide: VaultTimeoutSettingsService,
          useClass: Substitute.for<VaultTimeoutSettingsService>(),
        },
        {
          provide: EnvironmentService,
          useClass: Substitute.for<EnvironmentService>(),
        },
        {
          provide: ElectronStateService,
          useValue: stateServiceSubstitute,
        },
        {
          provide: ApiService,
          useClass: Substitute.for<ApiService>(),
        },
        {
          provide: ActivatedRoute,
          useClass: Substitute.for<ActivatedRoute>(),
        },
        {
          provide: BroadcasterService,
          useValue: broadcasterServiceMock,
        },
        {
          provide: PolicyApiServiceAbstraction,
          useClass: Substitute.for<PolicyApiServiceAbstraction>(),
        },
        {
          provide: InternalPolicyService,
          useClass: Substitute.for<InternalPolicyService>(),
        },
        {
          provide: PasswordStrengthServiceAbstraction,
          useClass: Substitute.for<PasswordStrengthServiceAbstraction>(),
        },
        {
          provide: LogService,
          useClass: Substitute.for<LogService>(),
        },
        {
          provide: DialogService,
          useClass: Substitute.for<DialogService>(),
        },
        {
          provide: DeviceTrustCryptoServiceAbstraction,
          useClass: Substitute.for<DeviceTrustCryptoServiceAbstraction>(),
        },
        {
          provide: UserVerificationService,
          useClass: Substitute.for<UserVerificationService>(),
        },
      ],
      schemas: [NO_ERRORS_SCHEMA],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(LockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    jest.clearAllMocks();
  });

  describe("ngOnInit", () => {
    it("should call super.ngOnInit() once", async () => {
      const superNgOnInitSpy = jest.spyOn(BaseLockComponent.prototype, "ngOnInit");
      await component.ngOnInit();
      expect(superNgOnInitSpy).toHaveBeenCalledTimes(1);
    });

    it('should set "autoPromptBiometric" to true if "stateService.getDisableAutoBiometricsPrompt()" resolves to false', async () => {
      stateServiceSubstitute.getDisableAutoBiometricsPrompt().resolves(false);

      await component.ngOnInit();
      expect(component["autoPromptBiometric"]).toBe(true);
    });

    it('should set "autoPromptBiometric" to false if "stateService.getDisableAutoBiometricsPrompt()" resolves to true', async () => {
      stateServiceSubstitute.getDisableAutoBiometricsPrompt().resolves(true);

      await component.ngOnInit();
      expect(component["autoPromptBiometric"]).toBe(false);
    });

    it('should set "biometricReady" to true if "stateService.getBiometricReady()" resolves to true', async () => {
      component["canUseBiometric"] = jest.fn().mockResolvedValue(true);

      await component.ngOnInit();
      expect(component["biometricReady"]).toBe(true);
    });

    it('should set "biometricReady" to false if "stateService.getBiometricReady()" resolves to false', async () => {
      component["canUseBiometric"] = jest.fn().mockResolvedValue(false);

      await component.ngOnInit();
      expect(component["biometricReady"]).toBe(false);
    });

    it("should call displayBiometricUpdateWarning", async () => {
      component["displayBiometricUpdateWarning"] = jest.fn();
      await component.ngOnInit();
      expect(component["displayBiometricUpdateWarning"]).toHaveBeenCalledTimes(1);
    });

    it("should call delayedAskForBiometric", async () => {
      component["delayedAskForBiometric"] = jest.fn();
      await component.ngOnInit();
      expect(component["delayedAskForBiometric"]).toHaveBeenCalledTimes(1);
      expect(component["delayedAskForBiometric"]).toHaveBeenCalledWith(500);
    });

    it("should call delayedAskForBiometric when queryParams change", async () => {
      component["route"].queryParams.pipe = jest
        .fn()
        .mockReturnValue(of({ promptBiometric: true }));

      component["delayedAskForBiometric"] = jest.fn();
      await component.ngOnInit();

      expect(component["delayedAskForBiometric"]).toHaveBeenCalledTimes(1);
      expect(component["delayedAskForBiometric"]).toHaveBeenCalledWith(500);
    });

    it("should call messagingService.send", async () => {
      await component.ngOnInit();
      expect(messagingServiceMock.send).toHaveBeenCalledWith("getWindowIsFocused");
    });

    describe("broadcasterService.subscribe", () => {
      it('should call onWindowHidden() when "broadcasterService.subscribe" is called with "windowHidden"', async () => {
        component["onWindowHidden"] = jest.fn();
        await component.ngOnInit();
        broadcasterServiceMock.subscribe.mock.calls[0][1]({ command: "windowHidden" });
        expect(component["onWindowHidden"]).toHaveBeenCalledTimes(1);
      });

      it('should call focusInput() when "broadcasterService.subscribe" is called with "windowIsFocused" is true and deferFocus is false', async () => {
        component["focusInput"] = jest.fn();
        component["deferFocus"] = null;
        await component.ngOnInit();
        broadcasterServiceMock.subscribe.mock.calls[0][1]({
          command: "windowIsFocused",
          windowIsFocused: true,
        } as any);
        expect(component["deferFocus"]).toBe(false);
        expect(component["focusInput"]).toHaveBeenCalledTimes(1);
      });

      it('should not call focusInput() when "broadcasterService.subscribe" is called with "windowIsFocused" is true and deferFocus is true', async () => {
        component["focusInput"] = jest.fn();
        component["deferFocus"] = null;
        await component.ngOnInit();
        broadcasterServiceMock.subscribe.mock.calls[0][1]({
          command: "windowIsFocused",
          windowIsFocused: false,
        } as any);
        expect(component["deferFocus"]).toBe(true);
        expect(component["focusInput"]).toHaveBeenCalledTimes(0);
      });

      it('should call focusInput() when "broadcasterService.subscribe" is called with "windowIsFocused" is true and deferFocus is true', async () => {
        component["focusInput"] = jest.fn();
        component["deferFocus"] = true;
        await component.ngOnInit();
        broadcasterServiceMock.subscribe.mock.calls[0][1]({
          command: "windowIsFocused",
          windowIsFocused: true,
        } as any);
        expect(component["deferFocus"]).toBe(false);
        expect(component["focusInput"]).toHaveBeenCalledTimes(1);
      });

      it('should not call focusInput() when "broadcasterService.subscribe" is called with "windowIsFocused" is false and deferFocus is true', async () => {
        component["focusInput"] = jest.fn();
        component["deferFocus"] = true;
        await component.ngOnInit();
        broadcasterServiceMock.subscribe.mock.calls[0][1]({
          command: "windowIsFocused",
          windowIsFocused: false,
        } as any);
        expect(component["deferFocus"]).toBe(true);
        expect(component["focusInput"]).toHaveBeenCalledTimes(0);
      });
    });
  });

  describe("ngOnDestroy", () => {
    it("should call super.ngOnDestroy()", () => {
      const superNgOnDestroySpy = jest.spyOn(BaseLockComponent.prototype, "ngOnDestroy");
      component.ngOnDestroy();
      expect(superNgOnDestroySpy).toHaveBeenCalledTimes(1);
    });

    it("should call broadcasterService.unsubscribe()", () => {
      component.ngOnDestroy();
      expect(broadcasterServiceMock.unsubscribe).toHaveBeenCalledTimes(1);
    });
  });

  describe("focusInput", () => {
    it('should call "focus" on #pin input if pinEnabled is true', () => {
      component["pinEnabled"] = true;
      global.document.getElementById = jest.fn().mockReturnValue({ focus: jest.fn() });
      component["focusInput"]();
      expect(global.document.getElementById).toHaveBeenCalledWith("pin");
    });

    it('should call "focus" on #masterPassword input if pinEnabled is false', () => {
      component["pinEnabled"] = false;
      global.document.getElementById = jest.fn().mockReturnValue({ focus: jest.fn() });
      component["focusInput"]();
      expect(global.document.getElementById).toHaveBeenCalledWith("masterPassword");
    });
  });

  describe("delayedAskForBiometric", () => {
    beforeEach(() => {
      component["supportsBiometric"] = true;
      component["autoPromptBiometric"] = true;
    });

    it('should wait for "delay" milliseconds', fakeAsync(async () => {
      const delaySpy = jest.spyOn(global, "setTimeout");
      component["delayedAskForBiometric"](5000);

      tick(4000);
      component["biometricAsked"] = false;

      tick(1000);
      component["biometricAsked"] = true;

      expect(delaySpy).toHaveBeenCalledWith(expect.any(Function), 5000);
    }));

    it('should return; if "params" is defined and "params.promptBiometric" is false', fakeAsync(async () => {
      component["delayedAskForBiometric"](5000, { promptBiometric: false });
      tick(5000);
      expect(component["biometricAsked"]).toBe(false);
    }));

    it('should not return; if "params" is defined and "params.promptBiometric" is true', fakeAsync(async () => {
      component["delayedAskForBiometric"](5000, { promptBiometric: true });
      tick(5000);
      expect(component["biometricAsked"]).toBe(true);
    }));

    it('should not return; if "params" is undefined', fakeAsync(async () => {
      component["delayedAskForBiometric"](5000);
      tick(5000);
      expect(component["biometricAsked"]).toBe(true);
    }));

    it('should return; if "supportsBiometric" is false', fakeAsync(async () => {
      component["supportsBiometric"] = false;
      component["delayedAskForBiometric"](5000);
      tick(5000);
      expect(component["biometricAsked"]).toBe(false);
    }));

    it('should return; if "autoPromptBiometric" is false', fakeAsync(async () => {
      component["autoPromptBiometric"] = false;
      component["delayedAskForBiometric"](5000);
      tick(5000);
      expect(component["biometricAsked"]).toBe(false);
    }));

    it("should call unlockBiometric() if biometricAsked is false and window is visible", fakeAsync(async () => {
      component["unlockBiometric"] = jest.fn();
      component["biometricAsked"] = false;
      ipcRenderer.invoke = jest.fn().mockResolvedValue(true);
      component["delayedAskForBiometric"](5000);
      tick(5000);

      expect(component["unlockBiometric"]).toHaveBeenCalledTimes(1);
    }));

    it("should not call unlockBiometric() if biometricAsked is false and window is not visible", fakeAsync(async () => {
      component["unlockBiometric"] = jest.fn();
      component["biometricAsked"] = false;
      ipcRenderer.invoke = jest.fn().mockResolvedValue(false);
      component["delayedAskForBiometric"](5000);
      tick(5000);

      expect(component["unlockBiometric"]).toHaveBeenCalledTimes(0);
    }));

    it("should not call unlockBiometric() if biometricAsked is true", fakeAsync(async () => {
      component["unlockBiometric"] = jest.fn();
      component["biometricAsked"] = true;
      ipcRenderer.invoke = jest.fn().mockResolvedValue(true);

      component["delayedAskForBiometric"](5000);
      tick(5000);

      expect(component["unlockBiometric"]).toHaveBeenCalledTimes(0);
    }));
  });

  describe("canUseBiometric", () => {
    it('should return true if "ipcRenderer.invoke(biometric)" resolves to true', async () => {
      stateServiceSubstitute.getUserId().resolves("userId");
      ipcRenderer.invoke = jest.fn().mockResolvedValue(true);
      const result = await component["canUseBiometric"]();

      expect(result).toEqual(true);
    });

    it('should return false if "ipcRenderer.invoke(biometric)" resolves to false', async () => {
      stateServiceSubstitute.getUserId().resolves("userId");
      ipcRenderer.invoke = jest.fn().mockResolvedValue(false);
      const result = await component["canUseBiometric"]();

      expect(result).toEqual(false);
    });

    it('should return null if "ipcRenderer.invoke(biometric)" resolves to null', async () => {
      stateServiceSubstitute.getUserId().resolves("userId");
      ipcRenderer.invoke = jest.fn().mockResolvedValue(null);
      const result = await component["canUseBiometric"]();

      expect(result).toEqual(null);
    });
  });

  it('onWindowHidden() should set "showPassword" to false', () => {
    component["showPassword"] = true;
    component["onWindowHidden"]();
    expect(component["showPassword"]).toBe(false);
  });
});
