import { BehaviorSubject } from "rxjs";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CollectionService } from "@bitwarden/common/vault/abstractions/collection.service";
import { FolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";
import { VaultSettingsService } from "@bitwarden/common/vault/abstractions/vault-settings/vault-settings.service";
import { CipherType } from "@bitwarden/common/vault/enums";

import { VaultPopupListFiltersService } from "./vault-popup-list-filters.service";

describe("VaultPopupListFiltersService", () => {
  let service: VaultPopupListFiltersService;
  const showCardsCurrentTab$ = new BehaviorSubject<boolean>(true);
  const showIdentitiesCurrentTab$ = new BehaviorSubject<boolean>(true);
  const memberOrganizations$ = new BehaviorSubject<{ name: string; id: string }[]>([]);

  beforeEach(() => {
    showCardsCurrentTab$.next(true);
    showIdentitiesCurrentTab$.next(true);
    memberOrganizations$.next([]);

    const vaultSettingsService = {
      showCardsCurrentTab$,
      showIdentitiesCurrentTab$,
    } as unknown as VaultSettingsService;

    const folderService = {
      folderViews$: new BehaviorSubject([]),
    } as unknown as FolderService;

    const cipherService = {
      getAllDecrypted: Promise.resolve(),
    } as unknown as CipherService;

    const organizationService = {
      memberOrganizations$,
    } as unknown as OrganizationService;

    const i18nService = {
      t: (key: string) => key,
    } as I18nService;

    const collectionService = {
      getAllDecrypted: Promise.resolve(),
      getAllNested: () => Promise.resolve([]),
    } as unknown as CollectionService;

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
        expect(organizations.map((o) => o.name)).toEqual([]);
        done();
      });
    });

    it('adds "myVault" to the list of organizations when there are other organizations', (done) => {
      memberOrganizations$.next([{ name: "bobby's org", id: "1234-3323-23223" }]);

      service.organizations$.subscribe((organizations) => {
        expect(organizations.map((o) => o.name)).toEqual(["myVault", "bobby's org"]);
        done();
      });
    });

    it("sorts organizations by name", (done) => {
      memberOrganizations$.next([
        { name: "bobby's org", id: "1234-3323-23223" },
        { name: "alice's org", id: "2223-4343-99888" },
      ]);

      service.organizations$.subscribe((organizations) => {
        expect(organizations.map((o) => o.name)).toEqual(["myVault", "alice's org", "bobby's org"]);
        done();
      });
    });
  });

  describe("collections$", () => {});
});
