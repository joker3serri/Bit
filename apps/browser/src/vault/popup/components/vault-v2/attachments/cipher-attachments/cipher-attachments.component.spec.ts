import { ComponentFixture, TestBed } from "@angular/core/testing";
import { By } from "@angular/platform-browser";
import { mock } from "jest-mock-extended";

import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { CipherId } from "@bitwarden/common/types/guid";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { ToastService } from "@bitwarden/components";

import { CipherAttachmentsComponent } from "./cipher-attachments.component";

describe("CipherAttachmentsComponent", () => {
  let component: CipherAttachmentsComponent;
  let fixture: ComponentFixture<CipherAttachmentsComponent>;
  const showToast = jest.fn();
  const cipherView = {
    id: "5555-444-3333",
    type: CipherType.Login,
    name: "Test Login",
    login: {
      username: "username",
      password: "password",
    },
  } as CipherView;

  const cipherDomain = {
    decrypt: () => cipherView,
  };

  const cipherServiceGet = jest.fn().mockResolvedValue(cipherDomain);
  const saveAttachmentWithServer = jest.fn().mockResolvedValue(cipherDomain);

  beforeEach(async () => {
    cipherServiceGet.mockClear();
    showToast.mockClear();

    await TestBed.configureTestingModule({
      imports: [CipherAttachmentsComponent],
      providers: [
        {
          provide: CipherService,
          useValue: {
            get: cipherServiceGet,
            saveAttachmentWithServer,
            getKeyForCipherKeyDecryption: () => Promise.resolve(null),
          },
        },
        {
          provide: ToastService,
          useValue: {
            showToast,
          },
        },
        { provide: I18nService, useValue: { t: (key: string) => key } },
        { provide: LogService, useValue: mock<LogService>() },
        { provide: ConfigService, useValue: mock<ConfigService>() },
        { provide: PlatformUtilsService, useValue: mock<PlatformUtilsService>() },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(CipherAttachmentsComponent);
    component = fixture.componentInstance;
    component.cipherId = "5555-444-3333" as CipherId;
    fixture.detectChanges();
  });

  it("fetches cipherView using `cipherId`", async () => {
    await component.ngOnInit();

    expect(cipherServiceGet).toHaveBeenCalledWith("5555-444-3333");
    expect(component.cipher).toEqual(cipherView);
  });

  describe("bitSubmit", () => {
    let formLoadingSpy: jest.SpyInstance;
    let formDisabledSpy: jest.SpyInstance;

    beforeEach(() => {
      formLoadingSpy = jest.spyOn(component.formLoading, "emit");
      formDisabledSpy = jest.spyOn(component.formDisabled, "emit");
    });

    it("emits formLoading when bitSubmit loading changes", () => {
      component.bitSubmit.loading = true;

      expect(formLoadingSpy).toHaveBeenCalledWith(true);

      component.bitSubmit.loading = false;

      expect(formLoadingSpy).toHaveBeenCalledWith(false);
    });

    it("emits formDisabled when bitSubmit disabled changes", () => {
      component.bitSubmit.disabled = true;

      expect(formDisabledSpy).toHaveBeenCalledWith(true);

      component.bitSubmit.disabled = false;

      expect(formDisabledSpy).toHaveBeenCalledWith(false);
    });
  });

  describe("attachmentForm", () => {
    let formStatusChangeSpy: jest.SpyInstance;
    let file: File;

    beforeEach(() => {
      formStatusChangeSpy = jest.spyOn(component.formStatusChange, "emit");
      file = new File([""], "attachment.txt", { type: "text/plain" });

      const inputElement = fixture.debugElement.query(By.css("input[type=file]"));

      // Set the file value of the input element
      Object.defineProperty(inputElement.nativeElement, "files", {
        value: [file],
        writable: false,
      });

      // Trigger change event, for event listeners
      inputElement.nativeElement.dispatchEvent(new InputEvent("change"));
    });

    it("sets value of `file` control when input changes", () => {
      expect(component.attachmentForm.controls.file.value.name).toEqual(file.name);
    });

    it("emits formStatusChange when status changes", () => {
      expect(formStatusChangeSpy).toHaveBeenCalledWith("VALID");
    });
  });

  describe("submit", () => {
    it("shows error toast if no file is selected", async () => {
      await component.submit();

      expect(showToast).toHaveBeenCalledWith({
        variant: "error",
        title: "errorOccurred",
        message: "selectFile",
      });
    });

    it("shows error toast if file size is greater than 500MB", async () => {
      component.attachmentForm.controls.file.setValue({
        size: 524288001,
      } as File);

      await component.submit();

      expect(showToast).toHaveBeenCalledWith({
        variant: "error",
        title: "errorOccurred",
        message: "maxFileSize",
      });
    });

    describe("success", () => {
      const file = { size: 524287999 } as File;
      beforeEach(() => {
        component.attachmentForm.controls.file.setValue(file);
      });

      it("calls `saveAttachmentWithServer`", async () => {
        await component.submit();

        expect(saveAttachmentWithServer).toHaveBeenCalledWith(cipherDomain, file);
      });

      it("resets form and input values", async () => {
        await component.submit();

        const fileInput = fixture.debugElement.query(By.css("input[type=file]"));

        expect(fileInput.nativeElement.value).toEqual("");
        expect(component.attachmentForm.controls.file.value).toEqual(null);
      });

      it("shows success toast", async () => {
        await component.submit();

        expect(showToast).toHaveBeenCalledWith({
          variant: "success",
          title: null,
          message: "attachmentSaved",
        });
      });
    });
  });
});
