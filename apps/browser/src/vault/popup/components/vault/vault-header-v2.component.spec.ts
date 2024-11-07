import { CommonModule } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute } from "@angular/router";
import { mock } from "jest-mock-extended";
import { BehaviorSubject, Subject } from "rxjs";

import { CollectionService } from "@bitwarden/admin-console/common";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { MessageSender } from "@bitwarden/common/platform/messaging";
import { SyncService } from "@bitwarden/common/platform/sync";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { FolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";
import { VaultSettingsService } from "@bitwarden/common/vault/abstractions/vault-settings/vault-settings.service";
import { PasswordRepromptService } from "@bitwarden/vault";

import { AutofillService } from "../../../../autofill/services/abstractions/autofill.service";

import { VaultHeaderV2Component } from "./vault-header-v2.component";

describe("VaultHeaderV2Component", () => {
  let component: VaultHeaderV2Component;
  let fixture: ComponentFixture<VaultHeaderV2Component>;

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
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VaultHeaderV2Component);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("creates", () => {
    expect(component).toBeTruthy();
  });
});
