import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { CipherType } from "@bitwarden/common/vault/enums";
import { DialogService } from "@bitwarden/components";

import { BrowserApi } from "../../../../../platform/browser/browser-api";
import BrowserPopupUtils from "../../../../../platform/popup/browser-popup-utils";
import { AddEditFolderDialogComponent } from "../add-edit-folder-dialog/add-edit-folder-dialog.component";

import { NewItemDropdownV2Component, NewItemInitialValues } from "./new-item-dropdown-v2.component";

jest.mock("@bitwarden/angular/jslib.module");
jest.mock("@bitwarden/common/platform/misc/utils");
jest.mock("../../../../../platform/browser/browser-api");
jest.mock("../../../../../platform/popup/browser-popup-utils");

describe("NewItemDropdownV2Component", () => {
  let component: NewItemDropdownV2Component;
  let fixture: ComponentFixture<NewItemDropdownV2Component>;
  let dialogServiceMock: jest.Mocked<DialogService>;
  let routerMock: jest.Mocked<Router>;
  let browserApiMock: jest.Mocked<typeof BrowserApi>;

  const mockTab = { url: "https://example.com" };

  beforeEach(async () => {
    dialogServiceMock = {
      open: jest.fn(),
    } as any;

    routerMock = {} as any;

    browserApiMock = {
      getTabFromCurrentWindow: jest.fn().mockResolvedValue(mockTab),
    } as any;

    await TestBed.configureTestingModule({
      imports: [JslibModule],
      providers: [
        { provide: Router, useValue: routerMock },
        { provide: DialogService, useValue: dialogServiceMock },
        { provide: BrowserApi, useValue: browserApiMock },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(NewItemDropdownV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  describe("ngOnInit", () => {
    it("should initialize tab data", async () => {
      await component.ngOnInit();
      expect(browserApiMock.getTabFromCurrentWindow).toHaveBeenCalled();
      expect(component["tab"]).toEqual(mockTab);
    });
  });

  describe("buildQueryParams", () => {
    it("should build query params for a Login cipher when not popped out", () => {
      component.initialValues = {
        folderId: "222-333-444",
        organizationId: "444-555-666",
        collectionId: "777-888-999",
      } as NewItemInitialValues;

      jest.spyOn(BrowserPopupUtils, "inPopout").mockReturnValue(false); // not popped out
      jest.spyOn(Utils, "getHostname").mockReturnValue("example.com");

      const params = component.buildQueryParams(CipherType.Login);

      expect(params).toEqual({
        type: CipherType.Login.toString(),
        collectionId: "777-888-999",
        organizationId: "444-555-666",
        folderId: "222-333-444",
        uri: "https://example.com",
        name: "example.com",
      });
    });

    it("should build query params for a Login cipher when popped out", () => {
      component.initialValues = {
        collectionId: "777-888-999",
      } as NewItemInitialValues;

      jest.spyOn(BrowserPopupUtils, "inPopout").mockReturnValue(true); // popped out

      const params = component.buildQueryParams(CipherType.Login);

      expect(params).toEqual({
        type: CipherType.Login.toString(),
        collectionId: "777-888-999",
      });
    });

    it("should build query params for a secure note", () => {
      component.initialValues = {
        collectionId: "777-888-999",
      } as NewItemInitialValues;

      const params = component.buildQueryParams(CipherType.SecureNote);

      expect(params).toEqual({
        type: CipherType.SecureNote.toString(),
        collectionId: "777-888-999",
      });
    });

    it("should build query params for an Identity", () => {
      component.initialValues = {
        collectionId: "777-888-999",
      } as NewItemInitialValues;

      const params = component.buildQueryParams(CipherType.Identity);

      expect(params).toEqual({
        type: CipherType.Identity.toString(),
        collectionId: "777-888-999",
      });
    });

    it("should build query params for a Card", () => {
      component.initialValues = {
        collectionId: "777-888-999",
      } as NewItemInitialValues;

      const params = component.buildQueryParams(CipherType.Card);

      expect(params).toEqual({
        type: CipherType.Card.toString(),
        collectionId: "777-888-999",
      });
    });

    it("should build query params for a SshKey", () => {
      component.initialValues = {
        collectionId: "777-888-999",
      } as NewItemInitialValues;

      const params = component.buildQueryParams(CipherType.SshKey);

      expect(params).toEqual({
        type: CipherType.SshKey.toString(),
        collectionId: "777-888-999",
      });
    });
  });

  describe("openFolderDialog", () => {
    it("should open the folder dialog", () => {
      component.openFolderDialog();
      expect(dialogServiceMock.open).toHaveBeenCalledWith(AddEditFolderDialogComponent);
    });
  });
});
