import {
  ChangeDetectorRef,
  Component,
  NgZone,
  OnDestroy,
  OnInit,
  ViewChild,
  ViewContainerRef,
} from "@angular/core";
import { ActivatedRoute, Params, Router } from "@angular/router";
import { BehaviorSubject, combineLatest, firstValueFrom, Observable, Subject } from "rxjs";
import {
  debounceTime,
  distinctUntilChanged,
  filter,
  map,
  shareReplay,
  startWith,
  switchMap,
  takeUntil,
} from "rxjs/operators";

import { SearchPipe } from "@bitwarden/angular/pipes/search.pipe";
import { ModalService } from "@bitwarden/angular/services/modal.service";
import { BroadcasterService } from "@bitwarden/common/abstractions/broadcaster.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { RefreshTracker } from "@bitwarden/common/misc/refresh-tracker";
import { ServiceUtils } from "@bitwarden/common/misc/serviceUtils";
import { Organization } from "@bitwarden/common/models/domain/organization";
import { TreeNode } from "@bitwarden/common/models/domain/tree-node";
import { CollectionView } from "@bitwarden/common/models/view/collection.view";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { PasswordRepromptService } from "@bitwarden/common/vault/abstractions/password-reprompt.service";
import { SyncService } from "@bitwarden/common/vault/abstractions/sync/sync.service.abstraction";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { DialogService } from "@bitwarden/components";

import { CollectionAdminService } from "../../organizations/core";
import { EntityEventsComponent } from "../../organizations/manage/entity-events.component";
import { CollectionsComponent } from "../../organizations/vault/collections.component";
import { VaultFilterService } from "../../vault/individual-vault/vault-filter/services/abstractions/vault-filter.service";
import { VaultFilter } from "../../vault/individual-vault/vault-filter/shared/models/vault-filter.model";
import { RoutedVaultFilterBridgeService } from "../individual-vault/vault-filter/services/routed-vault-filter-bridge.service";
import { RoutedVaultFilterService } from "../individual-vault/vault-filter/services/routed-vault-filter.service";
import {
  All,
  RoutedVaultFilterModel,
  Unassigned,
} from "../individual-vault/vault-filter/shared/models/routed-vault-filter.model";
import { getNestedCollectionTree } from "../utils/collection-utils";

import { AddEditComponent } from "./add-edit.component";
import { AttachmentsComponent } from "./attachments.component";
import { VaultFilterComponent } from "./vault-filter/vault-filter.component";

const BroadcasterSubscriptionId = "OrgVaultComponent";
const SearchTextDebounceInterval = 200;

@Component({
  selector: "app-org-vault",
  templateUrl: "vault.component.html",
  providers: [RoutedVaultFilterService, RoutedVaultFilterBridgeService],
})
export class VaultComponent implements OnInit, OnDestroy {
  @ViewChild("vaultFilter", { static: true })
  vaultFilterComponent: VaultFilterComponent;
  // @ViewChild(VaultItemsComponent, { static: true }) vaultItemsComponent: VaultItemsComponent;
  @ViewChild("attachments", { read: ViewContainerRef, static: true })
  attachmentsModalRef: ViewContainerRef;
  @ViewChild("cipherAddEdit", { read: ViewContainerRef, static: true })
  cipherAddEditModalRef: ViewContainerRef;
  @ViewChild("collections", { read: ViewContainerRef, static: true })
  collectionsModalRef: ViewContainerRef;
  @ViewChild("eventsTemplate", { read: ViewContainerRef, static: true })
  eventsModalRef: ViewContainerRef;

  organization: Organization;
  trashCleanupWarning: string = null;
  activeFilter: VaultFilter = new VaultFilter();

  protected initialSyncCompleted = false;
  protected loading$: Observable<boolean>;
  protected filter$: Observable<RoutedVaultFilterModel>;
  protected allCollections$: Observable<CollectionView[]>;
  protected allOrganizations$: Observable<Organization[]>;
  protected ciphers$: Observable<CipherView[]>;
  protected collections$: Observable<CollectionView[]>;
  protected isEmpty$: Observable<boolean>;
  protected selectedCollection$: Observable<TreeNode<CollectionView> | undefined>;

  private refreshTracker = new RefreshTracker();
  private refresh$ = new BehaviorSubject<void>(null);

  private searchText$ = new Subject<string>();
  private destroy$ = new Subject<void>();

  constructor(
    private route: ActivatedRoute,
    private organizationService: OrganizationService,
    protected vaultFilterService: VaultFilterService,
    private routedVaultFilterBridgeService: RoutedVaultFilterBridgeService,
    private routedVaultFilterService: RoutedVaultFilterService,
    private router: Router,
    private changeDetectorRef: ChangeDetectorRef,
    private syncService: SyncService,
    private i18nService: I18nService,
    private modalService: ModalService,
    private dialogService: DialogService,
    private messagingService: MessagingService,
    private broadcasterService: BroadcasterService,
    private ngZone: NgZone,
    private platformUtilsService: PlatformUtilsService,
    private cipherService: CipherService,
    private passwordRepromptService: PasswordRepromptService,
    private collectionAdminService: CollectionAdminService,
    private searchService: SearchService,
    private searchPipe: SearchPipe
  ) {}

  async ngOnInit() {
    this.trashCleanupWarning = this.i18nService.t(
      this.platformUtilsService.isSelfHost()
        ? "trashCleanupWarningSelfHosted"
        : "trashCleanupWarning"
    );

    this.route.parent.params.pipe(takeUntil(this.destroy$)).subscribe((params) => {
      this.organization = this.organizationService.get(params.organizationId);
    });

    // TODO
    // this.route.queryParams.pipe(first(), takeUntil(this.destroy$)).subscribe((qParams) => {
    //   this.vaultItemsComponent.searchText = this.vaultFilterComponent.searchText = qParams.search;
    // });

    // verifies that the organization has been set
    combineLatest([this.route.queryParams, this.route.parent.params])
      .pipe(
        switchMap(async ([qParams]) => {
          const cipherId = getCipherIdFromParams(qParams);
          if (!cipherId) {
            return;
          }
          if (
            // Handle users with implicit collection access since they use the admin endpoint
            this.organization.canUseAdminCollections ||
            (await this.cipherService.get(cipherId)) != null
          ) {
            this.editCipherId(cipherId);
          } else {
            this.platformUtilsService.showToast(
              "error",
              this.i18nService.t("errorOccurred"),
              this.i18nService.t("unknownCipher")
            );
            this.router.navigate([], {
              queryParams: { cipherId: null, itemId: null },
              queryParamsHandling: "merge",
            });
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe();

    if (!this.organization.canUseAdminCollections) {
      this.broadcasterService.subscribe(BroadcasterSubscriptionId, (message: any) => {
        this.ngZone.run(async () => {
          switch (message.command) {
            case "syncCompleted":
              if (message.successfully) {
                await Promise.all([
                  this.vaultFilterService.reloadCollections(),
                  // this.vaultItemsComponent.refresh(),
                ]);
                this.refresh();
                this.changeDetectorRef.detectChanges();
              }
              break;
          }
        });
      });
      await this.syncService.fullSync(false);
    }

    this.routedVaultFilterBridgeService.activeFilter$
      .pipe(takeUntil(this.destroy$))
      .subscribe((activeFilter) => {
        this.activeFilter = activeFilter;
      });

    const debouncedSearchText$ = this.searchText$.pipe(
      debounceTime(SearchTextDebounceInterval),
      startWith("")
    );

    // loading$: Observable<boolean>;
    this.filter$ = this.routedVaultFilterService.filter$;

    const organizationId$ = this.filter$.pipe(
      map((filter) => filter.organizationId),
      distinctUntilChanged()
    );

    this.allCollections$ = this.refresh$.pipe(
      switchMap(() => organizationId$),
      this.refreshTracker.switchMap((orgId) => this.collectionAdminService.getAll(orgId)),
      takeUntil(this.destroy$),
      shareReplay({ refCount: false, bufferSize: 1 })
    );

    this.allOrganizations$ = this.refresh$.pipe(
      switchMap(() => organizationId$),
      map((organizationId) => [this.organizationService.get(organizationId)]),
      takeUntil(this.destroy$),
      shareReplay({ refCount: false, bufferSize: 1 })
    );
    // this.ciphers$: Observable<CipherView[]>;

    const nestedCollections$ = this.allCollections$.pipe(
      map((collections) => getNestedCollectionTree(collections)),
      takeUntil(this.destroy$),
      shareReplay({ refCount: false, bufferSize: 1 })
    );

    this.collections$ = combineLatest([
      nestedCollections$,
      this.filter$,
      debouncedSearchText$,
    ]).pipe(
      filter(([collections, filter]) => collections != undefined && filter != undefined),
      map(([collections, filter, searchText]) => {
        if (
          filter.collectionId === Unassigned ||
          (filter.collectionId === undefined && filter.type !== undefined)
        ) {
          return [];
        }

        let collectionsToReturn = [];
        if (filter.collectionId === undefined || filter.collectionId === All) {
          collectionsToReturn = collections.map((c) => c.node);
        } else {
          const selectedCollection = ServiceUtils.getTreeNodeObjectFromList(
            collections,
            filter.collectionId
          );
          collectionsToReturn = selectedCollection?.children.map((c) => c.node) ?? [];
        }

        if (this.searchService.isSearchable(searchText)) {
          collectionsToReturn = this.searchPipe.transform(
            collectionsToReturn,
            searchText,
            (collection) => collection.name,
            (collection) => collection.id
          );
        }

        return collectionsToReturn;
      }),
      takeUntil(this.destroy$),
      shareReplay({ refCount: false, bufferSize: 1 })
    );

    // this.isEmpty$: Observable<boolean>;
    // this.selectedCollection$: Observable<TreeNode<CollectionView> | undefined>;
  }

  ngOnDestroy() {
    this.broadcasterService.unsubscribe(BroadcasterSubscriptionId);
    this.destroy$.next();
    this.destroy$.complete();
  }

  async refreshItems() {
    // this.vaultItemsComponent.actionPromise = this.vaultItemsComponent.refresh();
    // await this.vaultItemsComponent.actionPromise;
    // this.vaultItemsComponent.actionPromise = null;
    this.refresh();
  }

  filterSearchText(searchText: string) {
    // TODO
    // this.vaultItemsComponent.searchText = searchText;
    // this.vaultItemsComponent.search(200);
  }

  async editCipherAttachments(cipher: CipherView) {
    if (this.organization.maxStorageGb == null || this.organization.maxStorageGb === 0) {
      this.messagingService.send("upgradeOrganization", { organizationId: cipher.organizationId });
      return;
    }

    let madeAttachmentChanges = false;

    const [modal] = await this.modalService.openViewRef(
      AttachmentsComponent,
      this.attachmentsModalRef,
      (comp) => {
        comp.organization = this.organization;
        comp.cipherId = cipher.id;
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        comp.onUploadedAttachment.subscribe(() => (madeAttachmentChanges = true));
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil
        comp.onDeletedAttachment.subscribe(() => (madeAttachmentChanges = true));
      }
    );

    // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
    modal.onClosed.subscribe(async () => {
      if (madeAttachmentChanges) {
        this.refresh();
        // await this.vaultItemsComponent.refresh();
      }
      madeAttachmentChanges = false;
    });
  }

  async editCipherCollections(cipher: CipherView) {
    const currCollections = await firstValueFrom(this.vaultFilterService.filteredCollections$);
    const [modal] = await this.modalService.openViewRef(
      CollectionsComponent,
      this.collectionsModalRef,
      (comp) => {
        comp.collectionIds = cipher.collectionIds;
        comp.collections = currCollections.filter((c) => !c.readOnly && c.id != null);
        comp.organization = this.organization;
        comp.cipherId = cipher.id;
        // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
        comp.onSavedCollections.subscribe(async () => {
          modal.close();
          this.refresh();
          // await this.vaultItemsComponent.refresh();
        });
      }
    );
  }

  async addCipher() {
    const collections = (await firstValueFrom(this.vaultFilterService.filteredCollections$)).filter(
      (c) => !c.readOnly && c.id != null
    );

    await this.editCipher(null, (comp) => {
      comp.organizationId = this.organization.id;
      comp.type = this.activeFilter.cipherType;
      comp.collections = collections;
      if (this.activeFilter.collectionId) {
        comp.collectionIds = [this.activeFilter.collectionId];
      }
    });
  }

  async navigateToCipher(cipher: CipherView) {
    this.go({ itemId: cipher?.id });
  }

  async editCipher(
    cipher: CipherView,
    additionalComponentParameters?: (comp: AddEditComponent) => void
  ) {
    return this.editCipherId(cipher?.id, additionalComponentParameters);
  }

  async editCipherId(
    cipherId: string,
    additionalComponentParameters?: (comp: AddEditComponent) => void
  ) {
    const cipher = await this.cipherService.get(cipherId);
    if (cipher != null && cipher.reprompt != 0) {
      if (!(await this.passwordRepromptService.showPasswordPrompt())) {
        this.go({ cipherId: null, itemId: null });
        return;
      }
    }

    const defaultComponentParameters = (comp: AddEditComponent) => {
      comp.organization = this.organization;
      comp.cipherId = cipherId;
      // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
      comp.onSavedCipher.subscribe(async () => {
        modal.close();
        // await this.vaultItemsComponent.refresh();
        this.refresh();
      });
      // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
      comp.onDeletedCipher.subscribe(async () => {
        modal.close();
        // await this.vaultItemsComponent.refresh();
        this.refresh();
      });
      // eslint-disable-next-line rxjs-angular/prefer-takeuntil, rxjs/no-async-subscribe
      comp.onRestoredCipher.subscribe(async () => {
        modal.close();
        // await this.vaultItemsComponent.refresh();
        this.refresh();
      });
    };

    const [modal, childComponent] = await this.modalService.openViewRef(
      AddEditComponent,
      this.cipherAddEditModalRef,
      additionalComponentParameters == null
        ? defaultComponentParameters
        : (comp) => {
            defaultComponentParameters(comp);
            additionalComponentParameters(comp);
          }
    );

    modal.onClosedPromise().then(() => {
      this.go({ cipherId: null, itemId: null });
    });

    return childComponent;
  }

  async cloneCipher(cipher: CipherView) {
    const collections = (await firstValueFrom(this.vaultFilterService.filteredCollections$)).filter(
      (c) => !c.readOnly && c.id != null
    );

    await this.editCipher(cipher, (comp) => {
      comp.cloneMode = true;
      comp.collections = collections;
      comp.organizationId = this.organization.id;
      comp.collectionIds = cipher.collectionIds;
    });
  }

  async viewEvents(cipher: CipherView) {
    await this.modalService.openViewRef(EntityEventsComponent, this.eventsModalRef, (comp) => {
      comp.name = cipher.name;
      comp.organizationId = this.organization.id;
      comp.entityId = cipher.id;
      comp.showUser = true;
      comp.entity = "cipher";
    });
  }

  private refresh() {
    this.refresh$.next();
  }

  private go(queryParams: any = null) {
    if (queryParams == null) {
      queryParams = {
        type: this.activeFilter.cipherType,
        collectionId: this.activeFilter.collectionId,
        deleted: this.activeFilter.isDeleted || null,
      };
    }

    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: queryParams,
      queryParamsHandling: "merge",
      replaceUrl: true,
    });
  }
}

/**
 * Allows backwards compatibility with
 * old links that used the original `cipherId` param
 */
const getCipherIdFromParams = (params: Params): string => {
  return params["itemId"] || params["cipherId"];
};
