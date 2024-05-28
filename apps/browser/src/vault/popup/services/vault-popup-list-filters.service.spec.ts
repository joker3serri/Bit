import { BehaviorSubject } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CollectionService } from "@bitwarden/common/vault/abstractions/collection.service";
import { FolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";
import { VaultSettingsService } from "@bitwarden/common/vault/abstractions/vault-settings/vault-settings.service";
import { CipherType } from "@bitwarden/common/vault/enums";
import { Collection } from "@bitwarden/common/vault/models/domain/collection";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { CollectionView } from "@bitwarden/common/vault/models/view/collection.view";
import { FolderView } from "@bitwarden/common/vault/models/view/folder.view";

import {
  MY_VAULT_ID,
  PopupListFilter,
  VaultPopupListFiltersService,
} from "./vault-popup-list-filters.service";

describe("VaultPopupListFiltersService", () => {
  let service: VaultPopupListFiltersService;
  const showCardsCurrentTab$ = new BehaviorSubject<boolean>(true);
  const showIdentitiesCurrentTab$ = new BehaviorSubject<boolean>(true);
  const memberOrganizations$ = new BehaviorSubject<{ name: string; id: string }[]>([]);
  const folderViews$ = new BehaviorSubject([]);
  const cipherViews$ = new BehaviorSubject({});

  const collectionService = {
    getAllDecrypted: Promise.resolve(),
    getAllNested: () => Promise.resolve([]),
  } as unknown as CollectionService;

  const folderService = {
    folderViews$,
  } as unknown as FolderService;

  beforeEach(() => {
    showCardsCurrentTab$.next(true);
    showIdentitiesCurrentTab$.next(true);
    memberOrganizations$.next([]);

    collectionService.getAllDecrypted = () => Promise.resolve([]);
    collectionService.getAllNested = () => Promise.resolve([]);

    const vaultSettingsService = {
      showCardsCurrentTab$,
      showIdentitiesCurrentTab$,
    } as unknown as VaultSettingsService;

    const cipherService = {
      cipherViews$,
    } as unknown as CipherService;

    const organizationService = {
      memberOrganizations$,
    } as unknown as OrganizationService;

    const i18nService = {
      t: (key: string) => key,
    } as I18nService;

    service = new VaultPopupListFiltersService(
      vaultSettingsService,
      folderService,
      cipherService,
      organizationService,
      i18nService,
      collectionService,
    );
  });

  describe("cipherTypes$", () => {
    it("returns all cipher types", (done) => {
      service.cipherTypes$.subscribe((cipherTypes) => {
        expect(cipherTypes.map((c) => c.value)).toEqual([
          CipherType.Login,
          CipherType.Card,
          CipherType.Identity,
          CipherType.SecureNote,
        ]);
        done();
      });
    });

    it("filters out cards when showCardsCurrentTab$ is false", (done) => {
      showCardsCurrentTab$.next(false);
      service.cipherTypes$.subscribe((cipherTypes) => {
        expect(cipherTypes.map((c) => c.value)).toEqual([
          CipherType.Login,
          CipherType.Identity,
          CipherType.SecureNote,
        ]);
        done();
      });
    });

    it("filters out identities when showIdentitiesCurrentTab$ is false", (done) => {
      showIdentitiesCurrentTab$.next(false);
      service.cipherTypes$.subscribe((cipherTypes) => {
        expect(cipherTypes.map((c) => c.value)).toEqual([
          CipherType.Login,
          CipherType.Card,
          CipherType.SecureNote,
        ]);
        done();
      });
    });
  });

  describe("organizations$", () => {
    it('does not add "myVault" to the list of organizations when there are no organizations', (done) => {
      memberOrganizations$.next([]);

      service.organizations$.subscribe((organizations) => {
        expect(organizations.map((o) => o.label)).toEqual([]);
        done();
      });
    });

    it('adds "myVault" to the list of organizations when there are other organizations', (done) => {
      memberOrganizations$.next([{ name: "bobby's org", id: "1234-3323-23223" }]);

      service.organizations$.subscribe((organizations) => {
        expect(organizations.map((o) => o.label)).toEqual(["myVault", "bobby's org"]);
        done();
      });
    });

    it("sorts organizations by name", (done) => {
      memberOrganizations$.next([
        { name: "bobby's org", id: "1234-3323-23223" },
        { name: "alice's org", id: "2223-4343-99888" },
      ]);

      service.organizations$.subscribe((organizations) => {
        expect(organizations.map((o) => o.label)).toEqual([
          "myVault",
          "alice's org",
          "bobby's org",
        ]);
        done();
      });
    });
  });

  describe("collections$", () => {
    const testCollection = {
      id: "14cbf8e9-7a2a-4105-9bf6-b15c01203cef",
      name: "Test collection",
      organizationId: "3f860945-b237-40bc-a51e-b15c01203ccf",
    } as CollectionView;

    const testCollection2 = {
      id: "b15c0120-7a2a-4105-9bf6-b15c01203ceg",
      name: "Test collection 2",
      organizationId: "1203ccf-2432-123-acdd-b15c01203ccf",
    } as CollectionView;
    const testCollections = [testCollection, testCollection2];
    beforeEach(() => {
      collectionService.getAllDecrypted = () => Promise.resolve(testCollections);

      collectionService.getAllNested = () =>
        Promise.resolve(
          testCollections.map((c) => ({
            children: [],
            node: c,
            parent: null,
          })),
        );
    });

    it("returns all collections", (done) => {
      service.collections$.subscribe((collections) => {
        expect(collections.map((c) => c.label)).toEqual(["Test collection", "Test collection 2"]);
        done();
      });
    });

    it("filters out collections that do not belong to an organization", () => {
      service.updateFilter({
        organization: { id: testCollection2.organizationId } as Organization,
      });

      service.collections$.subscribe((collections) => {
        expect(collections.map((c) => c.label)).toEqual(["Test collection 2"]);
      });
    });
  });

  describe("folders$", () => {
    it('returns no folders when "No Folder" is the only option', (done) => {
      folderViews$.next([{ id: null, name: "No Folder" }]);

      service.folders$.subscribe((folders) => {
        expect(folders).toEqual([]);
        done();
      });
    });

    it('moves "No Folder" to the end of the list', (done) => {
      folderViews$.next([
        { id: null, name: "No Folder" },
        { id: "2345", name: "Folder 2" },
        { id: "1234", name: "Folder 1" },
      ]);

      service.folders$.subscribe((folders) => {
        expect(folders.map((f) => f.label)).toEqual(["Folder 1", "Folder 2", "itemsWithNoFolder"]);
        done();
      });
    });

    it("returns all folders when MyVault is selected", (done) => {
      service.updateFilter({
        organization: { id: MY_VAULT_ID } as Organization,
      });
      folderViews$.next([
        { id: "1234", name: "Folder 1" },
        { id: "2345", name: "Folder 2" },
      ]);

      service.folders$.subscribe((folders) => {
        expect(folders.map((f) => f.label)).toEqual(["Folder 1", "Folder 2"]);
        done();
      });
    });

    it("returns folders that have ciphers within the selected organization", (done) => {
      service.updateFilter({
        organization: { id: "1234" } as Organization,
      });

      folderViews$.next([
        { id: "1234", name: "Folder 1" },
        { id: "2345", name: "Folder 2" },
      ]);

      cipherViews$.next({
        "1": { folderId: "1234", organizationId: "1234" },
        "2": { folderId: "2345", organizationId: "56789" },
      });

      service.folders$.subscribe((folders) => {
        expect(folders.map((f) => f.label)).toEqual(["Folder 1"]);
        done();
      });
    });
  });

  describe("filterCiphers", () => {
    const ciphers = [
      { type: CipherType.Login, collectionIds: [], organizationId: null },
      { type: CipherType.Card, collectionIds: ["1234"], organizationId: "8978" },
      { type: CipherType.Identity, collectionIds: [], folderId: "5432", organizationId: null },
      { type: CipherType.SecureNote, collectionIds: [], organizationId: null },
    ] as CipherView[];

    const filters: PopupListFilter = {
      cipherType: null,
      organization: null,
      collection: null,
      folder: null,
    };

    it("filters by cipherType", () => {
      expect(service.filterCiphers(ciphers, { ...filters, cipherType: CipherType.Login })).toEqual([
        ciphers[0],
      ]);
    });

    it("filters by collection", () => {
      const collection = { id: "1234" } as Collection;
      expect(service.filterCiphers(ciphers, { ...filters, collection })).toEqual([ciphers[1]]);
    });

    it("filters by folder", () => {
      const folder = { id: "5432" } as FolderView;
      expect(service.filterCiphers(ciphers, { ...filters, folder })).toEqual([ciphers[2]]);
    });

    describe("organizationId", () => {
      it("filters out ciphers that belong to an organization when MyVault is selected", () => {
        const organization = { id: MY_VAULT_ID } as Organization;
        expect(service.filterCiphers(ciphers, { ...filters, organization })).toEqual([
          ciphers[0],
          ciphers[2],
          ciphers[3],
        ]);
      });

      it("filters out ciphers that do not belong to the selected organization", () => {
        const organization = { id: "8978" } as Organization;
        expect(service.filterCiphers(ciphers, { ...filters, organization })).toEqual([ciphers[1]]);
      });
    });
  });
});
