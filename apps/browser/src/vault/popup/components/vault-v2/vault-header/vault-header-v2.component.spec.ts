import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { FormBuilder } from "@angular/forms";
import { By } from "@angular/platform-browser";
import { ActivatedRoute } from "@angular/router";
import { mock } from "jest-mock-extended";
import { BehaviorSubject, Subject } from "rxjs";

import { Collection, CollectionService } from "@bitwarden/admin-console/common";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { MessageSender } from "@bitwarden/common/platform/messaging";
import { SyncService } from "@bitwarden/common/platform/sync";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { FolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";
import { VaultSettingsService } from "@bitwarden/common/vault/abstractions/vault-settings/vault-settings.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { FolderView } from "@bitwarden/common/vault/models/view/folder.view";
import { PasswordRepromptService } from "@bitwarden/vault";

import { AutofillService } from "../../../../../autofill/services/abstractions/autofill.service";
import {
  PopupListFilter,
  VaultPopupListFiltersService,
} from "../../../../../vault/popup/services/vault-popup-list-filters.service";

import { VaultHeaderV2Component } from "./vault-header-v2.component";

describe("VaultHeaderV2Component", () => {
  let component: VaultHeaderV2Component;
  let fixture: ComponentFixture<VaultHeaderV2Component>;

  const emptyForm: PopupListFilter = {
    organization: null,
    collection: null,
    folder: null,
    cipherType: null,
  };

  const filters$ = new BehaviorSubject<PopupListFilter>(emptyForm);

  /** When it exists, returns the notification badge debug element */
  const getBadge = () => fixture.debugElement.query(By.css('[data-testid="filter-badge"]'));

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [VaultHeaderV2Component, CommonModule],
      providers: [
        {
          provide: CipherService,
          useValue: mock<CipherService>({ cipherViews$: new BehaviorSubject([]) }),
        },
        { provide: VaultSettingsService, useValue: mock<VaultSettingsService>() },
        { provide: FolderService, useValue: mock<FolderService>() },
        { provide: OrganizationService, useValue: mock<OrganizationService>() },
        { provide: CollectionService, useValue: mock<CollectionService>() },
        { provide: PolicyService, useValue: mock<PolicyService>() },
        { provide: SearchService, useValue: mock<SearchService>() },
        { provide: PlatformUtilsService, useValue: mock<PlatformUtilsService>() },
        { provide: AutofillService, useValue: mock<AutofillService>() },
        { provide: PasswordRepromptService, useValue: mock<PasswordRepromptService>() },
        { provide: MessageSender, useValue: mock<MessageSender>() },
        { provide: AccountService, useValue: mock<AccountService>() },
        {
          provide: SyncService,
          useValue: mock<SyncService>({ activeUserLastSync$: () => new Subject() }),
        },
        { provide: ActivatedRoute, useValue: { queryParams: new BehaviorSubject({}) } },
        { provide: I18nService, useValue: { t: (key: string) => key } },
        {
          provide: VaultPopupListFiltersService,
          useValue: { filters$, filterForm: new FormBuilder().group(emptyForm) },
        },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VaultHeaderV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("does not show filter badge when no filters are selected", () => {
    component.disclosure.open = false;
    filters$.next(emptyForm);
    fixture.detectChanges();

    expect(getBadge()).toBeNull();
  });

  it("does not show filter badge when disclosure is open", () => {
    component.disclosure.open = true;
    filters$.next({
      ...emptyForm,
      collection: { id: "col1" } as Collection,
    });
    fixture.detectChanges();

    expect(getBadge()).toBeNull();
  });

  it("shows the notification badge when there are populated filters and the disclosure is closed", () => {
    component.disclosure.open = false;
    filters$.next({
      ...emptyForm,
      collection: { id: "col1" } as Collection,
    });
    fixture.detectChanges();

    expect(getBadge()).not.toBeNull();
  });

  it("displays the number of filters populated", () => {
    component.disclosure.open = false;
    filters$.next({
      ...emptyForm,
      organization: { id: "org1" } as Organization,
    });
    fixture.detectChanges();

    expect(getBadge().nativeElement.textContent.trim()).toBe("1");

    filters$.next({
      ...emptyForm,
      organization: { id: "org1" } as Organization,
      collection: { id: "col1" } as Collection,
    });
    fixture.detectChanges();

    expect(getBadge().nativeElement.textContent.trim()).toBe("2");

    filters$.next({
      folder: { id: "folder1" } as FolderView,
      cipherType: CipherType.Login,
      organization: { id: "org1" } as Organization,
      collection: { id: "col1" } as Collection,
    });
    fixture.detectChanges();
  });
});
