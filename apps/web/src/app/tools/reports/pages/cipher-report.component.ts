// FIXME: Update this file to be type safe and remove this and next line
// @ts-strict-ignore

import { DialogRef } from "@angular/cdk/dialog";
import { Directive, ViewChild, ViewContainerRef, OnDestroy } from "@angular/core";
import { BehaviorSubject, lastValueFrom, Observable, Subject, takeUntil } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { CipherId, CollectionId, OrganizationId } from "@bitwarden/common/types/guid";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { CipherRepromptType } from "@bitwarden/common/vault/enums/cipher-reprompt-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { DialogService, TableDataSource } from "@bitwarden/components";
import {
  CipherFormConfig,
  CipherFormConfigService,
  PasswordRepromptService,
} from "@bitwarden/vault";

import {
  VaultItemDialogComponent,
  VaultItemDialogMode,
  VaultItemDialogResult,
} from "../../../vault/components/vault-item-dialog/vault-item-dialog.component";

@Directive()
export class CipherReportComponent implements OnDestroy {
  @ViewChild("cipherAddEdit", { read: ViewContainerRef, static: true })
  cipherAddEditModalRef: ViewContainerRef;
  isAdminConsoleActive = false;

  loading = false;
  hasLoaded = false;
  ciphers: CipherView[] = [];
  allCiphers: CipherView[] = [];
  dataSource = new TableDataSource<CipherView>();
  organization: Organization;
  organizations: Organization[];
  organizations$: Observable<Organization[]>;

  filterStatus: any = [0];
  showFilterToggle: boolean = false;
  vaultMsg: string = "vault";
  currentFilterStatus: number | string;
  protected filterOrgStatus$ = new BehaviorSubject<number | string>(0);
  private destroyed$: Subject<void> = new Subject();
  private vaultItemDialogRef?: DialogRef<VaultItemDialogResult> | undefined;

  constructor(
    protected cipherService: CipherService,
    private dialogService: DialogService,
    protected passwordRepromptService: PasswordRepromptService,
    protected organizationService: OrganizationService,
    protected i18nService: I18nService,
    private syncService: SyncService,
    private cipherFormConfigService: CipherFormConfigService,
  ) {
    this.organizations$ = this.organizationService.organizations$;
    this.organizations$.pipe(takeUntil(this.destroyed$)).subscribe((orgs) => {
      this.organizations = orgs;
    });
  }

  ngOnDestroy(): void {
    this.destroyed$.next();
    this.destroyed$.complete();
  }

  getName(filterId: string | number) {
    let orgName: any;

    if (filterId === 0) {
      orgName = this.i18nService.t("all");
    } else if (filterId === 1) {
      orgName = this.i18nService.t("me");
    } else {
      this.organizations.filter((org: Organization) => {
        if (org.id === filterId) {
          orgName = org.name;
          return org;
        }
      });
    }
    return orgName;
  }

  getCount(filterId: string | number) {
    let orgFilterStatus: any;
    let cipherCount;

    if (filterId === 0) {
      cipherCount = this.allCiphers.length;
    } else if (filterId === 1) {
      cipherCount = this.allCiphers.filter((c) => c.organizationId === null).length;
    } else {
      this.organizations.filter((org: Organization) => {
        if (org.id === filterId) {
          orgFilterStatus = org.id;
          return org;
        }
      });
      cipherCount = this.allCiphers.filter((c) => c.organizationId === orgFilterStatus).length;
    }
    return cipherCount;
  }

  async filterOrgToggle(status: any) {
    let filter = null;
    if (typeof status === "number" && status === 1) {
      filter = (c: CipherView) => c.organizationId == null;
    } else if (typeof status === "string") {
      const orgId = status as OrganizationId;
      filter = (c: CipherView) => c.organizationId === orgId;
    }
    this.dataSource.filter = filter;
  }

  async load() {
    this.loading = true;
    await this.syncService.fullSync(false);
    // when a user fixes an item in a report we want to persist the filter they had
    // if they fix the last item of that filter we will go back to the "All" filter
    if (this.currentFilterStatus) {
      if (this.ciphers.length > 2) {
        this.filterOrgStatus$.next(this.currentFilterStatus);
        await this.filterOrgToggle(this.currentFilterStatus);
      } else {
        this.filterOrgStatus$.next(0);
        await this.filterOrgToggle(0);
      }
    } else {
      await this.setCiphers();
    }
    this.loading = false;
    this.hasLoaded = true;
  }
  async selectCipher(cipher: CipherView) {
    if (!(await this.repromptCipher(cipher))) {
      return;
    }

    const cipherFormConfig = await this.cipherFormConfigService.buildConfig(
      "edit",
      cipher.id as CipherId,
      cipher.type,
    );

    await this.openVaultItemDialog("view", cipherFormConfig);
  }

  /**
   * Open the combined view / edit dialog for a cipher.
   * @param mode - Starting mode of the dialog.
   * @param formConfig - Configuration for the form when editing/adding a cipher.
   * @param activeCollectionId - The active collection ID.
   */
  async openVaultItemDialog(
    mode: VaultItemDialogMode,
    formConfig: CipherFormConfig,
    activeCollectionId?: CollectionId,
  ) {
    this.vaultItemDialogRef = VaultItemDialogComponent.open(this.dialogService, {
      mode,
      formConfig,
      activeCollectionId,
    });

    const result = await lastValueFrom(this.vaultItemDialogRef.closed);
    this.vaultItemDialogRef = undefined;

    // When the dialog is closed for a premium upgrade, return early as the user
    // should be navigated to the subscription settings elsewhere
    if (result === VaultItemDialogResult.PremiumUpgrade) {
      return;
    }

    // If the dialog was closed by deleting the cipher, refresh the report.
    if (result === VaultItemDialogResult.Deleted || result === VaultItemDialogResult.Saved) {
      await this.load();
    }
  }

  protected async setCiphers() {
    this.allCiphers = [];
  }

  protected async repromptCipher(c: CipherView) {
    return (
      c.reprompt === CipherRepromptType.None ||
      (await this.passwordRepromptService.showPasswordPrompt())
    );
  }

  protected async getAllCiphers(): Promise<CipherView[]> {
    return await this.cipherService.getAllDecrypted();
  }

  protected filterCiphersByOrg(ciphersList: CipherView[]) {
    this.allCiphers = [...ciphersList];

    this.ciphers = ciphersList.map((ciph) => {
      if (this.filterStatus.indexOf(ciph.organizationId) === -1 && ciph.organizationId != null) {
        this.filterStatus.push(ciph.organizationId);
      } else if (this.filterStatus.indexOf(1) === -1 && ciph.organizationId == null) {
        this.filterStatus.splice(1, 0, 1);
      }
      return ciph;
    });
    this.dataSource.data = this.ciphers;

    if (this.filterStatus.length > 2) {
      this.showFilterToggle = true;
      this.vaultMsg = "vaults";
    } else {
      // If a user fixes an item and there is only one item left remove the filter toggle and change the vault message to singular
      this.showFilterToggle = false;
      this.vaultMsg = "vault";
    }
  }
}
