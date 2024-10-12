import { ComponentFixture, TestBed } from "@angular/core/testing";
import { MockProxy, mock } from "jest-mock-extended";
import { of } from "rxjs";

import { I18nPipe } from "@bitwarden/angular/platform/pipes/i18n.pipe";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { AuditService } from "@bitwarden/common/abstractions/audit.service";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PasswordStrengthServiceAbstraction } from "@bitwarden/common/tools/password-strength";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { TableModule } from "@bitwarden/components";
import { TableBodyDirective } from "@bitwarden/components/src/table/table.component";
import { PasswordRepromptService } from "@bitwarden/vault";
// eslint-disable-next-line no-restricted-imports
import { PipesModule } from "@bitwarden/web-vault/app/vault/individual-vault/pipes/pipes.module";

// eslint-disable-next-line no-restricted-imports
import { cipherData } from "../reports/pages/reports-ciphers.mock";

import { PasswordHealthComponent } from "./password-health.component";
import { userData } from "./password-health.mock";

describe("PasswordHealthComponent", () => {
  let component: PasswordHealthComponent;
  let fixture: ComponentFixture<PasswordHealthComponent>;
  let passwordStrengthService: MockProxy<PasswordStrengthServiceAbstraction>;
  let organizationService: MockProxy<OrganizationService>;
  let syncServiceMock: MockProxy<SyncService>;
  let cipherServiceMock: MockProxy<CipherService>;
  let auditServiceMock: MockProxy<AuditService>;

  beforeEach(async () => {
    passwordStrengthService = mock<PasswordStrengthServiceAbstraction>();
    auditServiceMock = mock<AuditService>();
    organizationService = mock<OrganizationService>();
    syncServiceMock = mock<SyncService>();
    cipherServiceMock = mock<CipherService>();

    organizationService.organizations$ = of([]);

    await TestBed.configureTestingModule({
      imports: [PipesModule, TableModule, TableBodyDirective],
      declarations: [I18nPipe],
      providers: [
        { provide: CipherService, useValue: cipherServiceMock },
        { provide: PasswordStrengthServiceAbstraction, useValue: passwordStrengthService },
        { provide: AuditService, useValue: auditServiceMock },
        { provide: OrganizationService, useValue: organizationService },
        { provide: ModalService, useValue: mock<ModalService>() },
        { provide: PasswordRepromptService, useValue: mock<PasswordRepromptService>() },
        { provide: SyncService, useValue: syncServiceMock },
        { provide: I18nService, useValue: mock<I18nService>() },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(PasswordHealthComponent);
    component = fixture.componentInstance;

    (component as any).cipherData = cipherData;
    (component as any).userData = userData;

    fixture.detectChanges();
  });

  it("should initialize component", () => {
    expect(component).toBeTruthy();
  });

  it("should populate reportCiphers with ciphers that have password issues", async () => {
    passwordStrengthService.getPasswordStrength.mockReturnValue({ score: 1 } as any);

    auditServiceMock.passwordLeaked.mockResolvedValue(5);

    await component.setCiphers();

    const cipherIds = component.reportCiphers.map((c) => c.id);

    expect(cipherIds).toEqual([
      "cbea34a8-bde4-46ad-9d19-b05001228ab2",
      "cbea34a8-bde4-46ad-9d19-b05001228cd3",
      "cbea34a8-bde4-46ad-9d19-b05001227nm6",
      "cbea34a8-bde4-46ad-9d19-b05001227nm7",
    ]);
    expect(component.reportCiphers.length).toEqual(4);
  });

  it("should call fullSync method of syncService", () => {
    expect(syncServiceMock.fullSync).toHaveBeenCalledWith(false);
  });

  it("should correctly populate passwordStrengthMap", async () => {
    passwordStrengthService.getPasswordStrength.mockImplementation((password) => {
      let score = 0;
      if (password === "123") {
        score = 1;
      } else {
        score = 4;
      }
      return { score } as any;
    });

    auditServiceMock.passwordLeaked.mockResolvedValue(0);

    await component.setCiphers();

    expect(component.passwordStrengthMap.size).toBeGreaterThan(0);
    expect(component.passwordStrengthMap.get("cbea34a8-bde4-46ad-9d19-b05001228ab2")).toEqual([
      "veryWeak",
      "danger",
    ]);
    expect(component.passwordStrengthMap.get("cbea34a8-bde4-46ad-9d19-b05001228cd3")).toEqual([
      "veryWeak",
      "danger",
    ]);
  });
});
