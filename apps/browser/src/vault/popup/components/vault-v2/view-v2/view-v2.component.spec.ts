import { ComponentFixture, fakeAsync, flush, TestBed } from "@angular/core/testing";
import { ActivatedRoute, Router } from "@angular/router";
import { mock } from "jest-mock-extended";
import { Subject } from "rxjs";

import { WINDOW } from "@bitwarden/angular/services/injection-tokens";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { ToastService } from "@bitwarden/components";
import { PasswordRepromptService } from "@bitwarden/vault";

import AutofillService from "../../../../../autofill/services/autofill.service";
import BrowserPopupUtils from "../../../../../platform/popup/browser-popup-utils";
import { PopupRouterCacheService } from "../../../../../platform/popup/view-cache/popup-router-cache.service";

import { ViewV2Component } from "./view-v2.component";

// 'qrcode-parser' is used by `BrowserTotpCaptureService` but is an es6 module that jest can't compile.
// Mock the entire module here to prevent jest from throwing an error. I wasn't able to find a way to mock the
// `BrowserTotpCaptureService` where jest would not load the file in the first place.
jest.mock("qrcode-parser", () => {});

describe("ViewV2Component", () => {
  let component: ViewV2Component;
  let fixture: ComponentFixture<ViewV2Component>;
  const params$ = new Subject();
  const mockNavigate = jest.fn();
  let toastService: ToastService;
  let passwordRepromptService: PasswordRepromptService;

  const mockCipher = {
    id: "122-333-444",
    type: CipherType.Login,
  };

  const mockToastService = {
    showToast: jest.fn(),
  };

  const mockpasswordRepromptService = {
    showPasswordPrompt: jest.fn(),
  };

  const mockCipherService = {
    get: jest.fn().mockResolvedValue({ decrypt: jest.fn().mockResolvedValue(mockCipher) }),
    getKeyForCipherKeyDecryption: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    mockNavigate.mockClear();

    await TestBed.configureTestingModule({
      imports: [ViewV2Component],
      providers: [
        { provide: Router, useValue: { navigate: mockNavigate } },
        { provide: CipherService, useValue: mockCipherService },
        { provide: LogService, useValue: mock<LogService>() },
        { provide: PlatformUtilsService, useValue: mock<PlatformUtilsService>() },
        { provide: ConfigService, useValue: mock<ConfigService>() },
        { provide: PopupRouterCacheService, useValue: mock<PopupRouterCacheService>() },
        { provide: ActivatedRoute, useValue: { queryParams: params$ } },
        {
          provide: I18nService,
          useValue: {
            t: (key: string, ...rest: string[]) => {
              if (rest?.length) {
                return `${key} ${rest.join(" ")}`;
              }
              return key;
            },
          },
        },
        { provide: ToastService, useValue: mockToastService },
        { provide: PlatformUtilsService, useValue: mock<PlatformUtilsService>() },
        { provide: PasswordRepromptService, useValue: mockpasswordRepromptService },
        { provide: AutofillService, useValue: mock<AutofillService>() },
        { provide: MessagingService, useValue: mock<MessagingService>() },
        { provide: WINDOW, useValue: mock<Window> },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ViewV2Component);
    component = fixture.componentInstance;
    toastService = TestBed.inject(ToastService);
    passwordRepromptService = TestBed.inject(PasswordRepromptService);

    jest.spyOn(BrowserPopupUtils, "inPopout").mockReturnValue(true);
    fixture.detectChanges();
  });

  describe("queryParams", () => {
    it("loads an existing cipher", fakeAsync(() => {
      params$.next({ cipherId: "122-333-444" });

      flush(); // Resolve all promises

      expect(mockCipherService.get).toHaveBeenCalledWith("122-333-444");
      expect(component.cipher).toEqual(mockCipher);
    }));

    it("sets the correct header text", fakeAsync(() => {
      // Set header text for a login
      mockCipher.type = CipherType.Login;
      params$.next({ cipherId: mockCipher.id });
      flush(); // Resolve all promises

      expect(component.headerText).toEqual("viewItemHeader typelogin");

      // Set header text for a card
      mockCipher.type = CipherType.Card;
      params$.next({ cipherId: mockCipher.id });
      flush(); // Resolve all promises

      expect(component.headerText).toEqual("viewItemHeader typecard");

      // Set header text for an identity
      mockCipher.type = CipherType.Identity;
      params$.next({ cipherId: mockCipher.id });
      flush(); // Resolve all promises

      expect(component.headerText).toEqual("viewItemHeader typeidentity");

      // Set header text for a secure note
      mockCipher.type = CipherType.SecureNote;
      params$.next({ cipherId: mockCipher.id });
      flush(); // Resolve all promises

      expect(component.headerText).toEqual("viewItemHeader note");
    }));
  });

  describe("fillCipher", () => {
    it("should be called when user clicks fillCipher and show success toast", async () => {
      const toastServiceSpy = jest.spyOn(toastService, "showToast");
      const toastValues: any = {
        variant: "success",
        title: null,
        message: "autoFillSuccess",
      };
      const doAutofillSpy = jest.spyOn(component, "doAutofill").mockResolvedValue(true);

      await component.fillCipher();
      expect(doAutofillSpy).toHaveBeenCalled();
      expect(toastServiceSpy).toHaveBeenCalledWith(toastValues);
    });

    it("should call promptPassword if cipher has reprompt on", async () => {
      component.tab = mock<chrome.tabs.Tab>({ url: "https://goggle.com" });
      component.cipher = mock<CipherView>({ reprompt: 1 });
      const showPasswordPromptSpy = jest.spyOn(passwordRepromptService, "showPasswordPrompt");

      await component.doAutofill();
      expect(showPasswordPromptSpy).toHaveBeenCalled();
    });
  });

  describe("fillCipherAndSave", () => {
    it("should call doAutofill every time", async () => {
      component.tab = mock<chrome.tabs.Tab>({ url: "https://goggle.com" });
      component.cipher = mock<CipherView>({ login: { uris: [] } });
      const doAutofillSpy = jest.spyOn(component, "doAutofill").mockResolvedValue(true);

      await component.fillCipherAndSave();
      expect(doAutofillSpy).toHaveBeenCalled();
    });

    it("should show success toast on matching uri", async () => {
      component.tab = mock<chrome.tabs.Tab>({ url: "https://goggle.com" });
      component.cipher = mock<CipherView>({ login: { uris: [{ uri: "https://goggle.com" }] } });
      const doAutofillSpy = jest.spyOn(component, "doAutofill").mockResolvedValue(true);
      const toastServiceSpy = jest.spyOn(toastService, "showToast");
      const toastValues: any = {
        variant: "success",
        title: null,
        message: "autoFillSuccessAndSavedUri",
      };

      await component.fillCipherAndSave();
      expect(doAutofillSpy).toHaveBeenCalled();
      expect(toastServiceSpy).toHaveBeenCalledWith(toastValues);
    });
  });
});
