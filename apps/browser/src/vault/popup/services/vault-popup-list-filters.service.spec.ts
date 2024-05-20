import { BehaviorSubject } from "rxjs";

import { VaultSettingsService } from "@bitwarden/common/vault/abstractions/vault-settings/vault-settings.service";
import { CipherType } from "@bitwarden/common/vault/enums";

import { VaultPopupListFilterService } from "./vault-popup-list-filters.service";

describe("VaultPopupListFilterService", () => {
  let service: VaultPopupListFilterService;
  const showCardsCurrentTab$ = new BehaviorSubject<boolean>(true);
  const showIdentitiesCurrentTab$ = new BehaviorSubject<boolean>(true);

  beforeEach(() => {
    showCardsCurrentTab$.next(true);
    showIdentitiesCurrentTab$.next(true);

    const vaultSettingsService = {
      showCardsCurrentTab$,
      showIdentitiesCurrentTab$,
    } as unknown as VaultSettingsService;

    service = new VaultPopupListFilterService(vaultSettingsService);
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
});
