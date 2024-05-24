import { Injectable } from "@angular/core";
import {
  BehaviorSubject,
  Observable,
  combineLatest,
  distinctUntilChanged,
  map,
  switchMap,
} from "rxjs";

import { DynamicTreeNode } from "@bitwarden/angular/vault/vault-filter/models/dynamic-tree-node.model";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";
import { CipherId } from "@bitwarden/common/types/guid";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CollectionService } from "@bitwarden/common/vault/abstractions/collection.service";
import { FolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";
import { VaultSettingsService } from "@bitwarden/common/vault/abstractions/vault-settings/vault-settings.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { ITreeNodeObject, TreeNode } from "@bitwarden/common/vault/models/domain/tree-node";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";
import { FolderView } from "@bitwarden/common/vault/models/view/folder.view";
import { ServiceUtils } from "@bitwarden/common/vault/service-utils";
import { ChipSelectOption } from "@bitwarden/components";

/** All available cipher filters */
export type PopupListFilter = {
  organizationId: string | null;
  collectionId: string | null;
  folderId: string | null;
  cipherType: CipherType | null;
};

/** All cipher types */
const allCipherTypes: { value: CipherType; label: string; icon: string }[] = [
  {
    value: CipherType.Login,
    label: "logins",
    icon: "bwi-globe",
  },
  {
    value: CipherType.Card,
    label: "cards",
    icon: "bwi-credit-card",
  },
  {
    value: CipherType.Identity,
    label: "identities",
    icon: "bwi-id-card",
  },
  {
    value: CipherType.SecureNote,
    label: "notes",
    icon: "bwi-sticky-note",
  },
];

/** Delimiter that denotes a level of nesting  */
const NESTING_DELIMITER = "/";

/** Id assigned to the "My vault" organization */
export const MY_VAULT_ID = "MyVault";

@Injectable({
  providedIn: "root",
})
export class VaultPopupListFiltersService {
  private _filters$ = new BehaviorSubject<PopupListFilter>({
    organizationId: null,
    collectionId: null,
    cipherType: null,
    folderId: null,
  });
  filters$ = this._filters$.asObservable();

  constructor(
    private vaultSettingsService: VaultSettingsService,
    private folderService: FolderService,
    private cipherService: CipherService,
    private organizationService: OrganizationService,
    private i18nService: I18nService,
    private collectionService: CollectionService,
  ) {}

  /** Update filter observable */
  updateFilter(filters: Partial<PopupListFilter>): void {
    this._filters$.next({
      ...this._filters$.value,
      ...filters,
    });
  }

  /** Returns the list of ciphers that satisfy the filters */
  filterCiphers = (ciphers: CipherView[], filters: PopupListFilter): CipherView[] => {
    return ciphers.filter((cipher) => {
      if (filters.cipherType !== null && cipher.type !== filters.cipherType) {
        return false;
      }

      if (filters.collectionId !== null && !cipher.collectionIds.includes(filters.collectionId)) {
        return false;
      }

      if (filters.folderId !== null && cipher.folderId !== filters.folderId) {
        return false;
      }

      const isMyVault = filters.organizationId === MY_VAULT_ID;

      if (isMyVault) {
        if (cipher.organizationId !== null) {
          return false;
        }
      } else if (filters.organizationId !== null) {
        if (cipher.organizationId !== filters.organizationId) {
          return false;
        }
      }

      return true;
    });
  };

  /** Observable of the available cipher types */
  cipherTypes$: Observable<ChipSelectOption<string | CipherType>[]> = combineLatest([
    this.vaultSettingsService.showCardsCurrentTab$,
    this.vaultSettingsService.showIdentitiesCurrentTab$,
  ]).pipe(
    map(([showCards, showIdentities]) => {
      // Filter out cipher types that are not enabled within the user's settings
      return allCipherTypes.filter((cipherType) => {
        if (cipherType.value === CipherType.Card) {
          return showCards;
        }
        if (cipherType.value === CipherType.Identity) {
          return showIdentities;
        }
        return true;
      });
    }),
    map((cipherTypes) =>
      cipherTypes.map((cipherType) => ({
        ...cipherType,
        label: this.i18nService.t(cipherType.label),
      })),
    ),
  );

  /** Organization array structured to be directly passed to `ChipSelectComponent` */
  organizations$: Observable<ChipSelectOption<string>[]> =
    this.organizationService.memberOrganizations$.pipe(
      map((orgs) => orgs.sort(Utils.getSortFunction(this.i18nService, "name"))),
      map((orgs) => {
        if (orgs.length) {
          return [
            // When the user is a member of an organization, make  the "My Vault" option available
            {
              value: MY_VAULT_ID,
              label: this.i18nService.t("myVault"),
              icon: "bwi-user",
            },
            ...orgs.map((org) => {
              let icon = "bwi-business";

              if (!org.enabled) {
                // Show a warning icon if the organization is deactivated
                icon = "bwi-exclamation-triangle tw-text-danger";
              } else if (org.planProductType === 1) {
                // Show a family icon if the organization is a family org
                icon = "bwi-family";
              }

              return {
                value: org.id,
                label: org.name,
                icon,
              };
            }),
          ];
        }

        return [];
      }),
    );

  /** Folder array structured to be directly passed to `ChipSelectComponent` */
  folders$: Observable<ChipSelectOption<string>[]> = combineLatest([
    this.filters$.pipe(
      distinctUntilChanged(
        (previousFilter, currentFilter) =>
          // Only update the collections when the organizationId filter changes
          previousFilter?.organizationId === currentFilter?.organizationId,
      ),
    ),
    this.folderService.folderViews$,
    this.cipherService.cipherViews$,
  ]).pipe(
    map(
      ([filters, folders, ciphers]): [
        PopupListFilter,
        FolderView[],
        Record<CipherId, CipherView>,
      ] => {
        if (folders.length === 1 && folders[0].id === null) {
          // Do not display folder selections when only the "no folder" option is available.
          return [filters, [], ciphers];
        }

        // Sort folders by alphabetic name
        folders.sort(Utils.getSortFunction(this.i18nService, "name"));
        let arrangedFolders = folders;

        const noFolder = folders.find((f) => f.id === null);

        if (noFolder) {
          // Update `name` of the "no folder" option to "Items with no folder"
          noFolder.name = this.i18nService.t("itemsWithNoFolder");

          // Move the "no folder" option to the end of the list
          arrangedFolders = [...folders.filter((f) => f.id !== null), noFolder];
        }

        return [filters, arrangedFolders, ciphers];
      },
    ),
    map(([filters, folders, ciphers]) => {
      const organizationId = filters.organizationId;

      // When no org or "My vault" is selected, return all folders
      if (organizationId === null || organizationId === MY_VAULT_ID) {
        return folders;
      }

      const cipherViews = Object.values(ciphers);
      const orgCiphers = cipherViews.filter((c) => c.organizationId === organizationId);

      // Return only the folders that have ciphers within the filtered organization
      return folders.filter((f) => orgCiphers.some((oc) => oc.folderId === f.id) || f.id === null);
    }),
    map((folders) => {
      const nestedFolders = this.getAllFoldersNested(folders);
      return new DynamicTreeNode<FolderView>({
        fullList: folders,
        nestedList: nestedFolders,
      });
    }),
    map((folders) => folders.nestedList.map(this.convertToChipSelectOption.bind(this))),
  );

  /** Collection array structured to be directly passed to `ChipSelectComponent` */
  collections$: Observable<ChipSelectOption<string>[]> = this.filters$.pipe(
    distinctUntilChanged(
      (previousFilter, currentFilter) =>
        // Only update the collections when the organizationId filter changes
        previousFilter?.organizationId === currentFilter?.organizationId,
    ),
    switchMap(async (filters) => {
      const organizationId = filters.organizationId;

      // Get all stored collections
      const allCollections = await this.collectionService.getAllDecrypted();

      // When the organization filter is selected, filter out collections that do not belong to the selected organization
      const collections =
        organizationId === null
          ? allCollections
          : allCollections.filter((c) => c.organizationId === organizationId);

      return collections;
    }),
    switchMap(async (collections) => {
      const nestedCollections = await this.collectionService.getAllNested(collections);

      return new DynamicTreeNode<CollectionView>({
        fullList: collections,
        nestedList: nestedCollections,
      });
    }),
    map((collections) => collections.nestedList.map(this.convertToChipSelectOption.bind(this))),
  );

  /** Converts the given item into the `ChipSelectOption` structure  */
  private convertToChipSelectOption<T extends ITreeNodeObject>(
    item: TreeNode<T>,
  ): ChipSelectOption<string> {
    return {
      value: item.node.id,
      label: item.node.name,
      icon: "bwi-folder", // Organization & folder icons are the same
      children: item.children ? item.children.map(this.convertToChipSelectOption) : undefined,
    };
  }

  private getAllFoldersNested(folders: FolderView[]): TreeNode<FolderView>[] {
    const nodes: TreeNode<FolderView>[] = [];

    folders.forEach((f) => {
      const folderCopy = new FolderView();
      folderCopy.id = f.id;
      folderCopy.revisionDate = f.revisionDate;

      // Remove "/" from beginning and end of the folder name
      // then split the folder name by the delimiter
      const parts = f.name != null ? f.name.replace(/^\/+|\/+$/g, "").split(NESTING_DELIMITER) : [];
      ServiceUtils.nestedTraverse(nodes, 0, parts, folderCopy, null, NESTING_DELIMITER);
    });

    return nodes;
  }
}
