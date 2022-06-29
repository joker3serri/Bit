import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { CipherType } from "@bitwarden/common/enums/cipherType";
import { sequentialize } from "@bitwarden/common/misc/sequentialize";
import { CipherView } from "@bitwarden/common/models/view/cipherView";

import { StateService } from "src/services/abstractions/state.service";
import I18nService from "src/services/i18n.service";

import { GetCipherCommand } from "./getCipherCommand";

export class GetAllDecryptedCiphersCommand extends GetCipherCommand {
  constructor(
    stateService: StateService,
    protected cryptoService: CryptoService,
    protected i18nService: I18nService,
    protected searchService: () => SearchService
  ) {
    super(stateService);
  }

  async getDecryptedCipherCache(): Promise<CipherView[]> {
    const decryptedCiphers = await this.stateService.getDecryptedCiphers();
    return decryptedCiphers;
  }

  async setDecryptedCipherCache(value: CipherView[]) {
    await this.stateService.setDecryptedCiphers(value);
    if (this.searchService != null) {
      if (value == null) {
        this.searchService().clearIndex();
      } else {
        this.searchService().indexCiphers();
      }
    }
  }

  @sequentialize(() => "getAllDecrypted")
  async getAllDecrypted(): Promise<CipherView[]> {
    const userId = await this.stateService.getUserId();
    if ((await this.getDecryptedCipherCache()) != null) {
      if (
        this.searchService != null &&
        (this.searchService().indexedEntityId ?? userId) !== userId
      ) {
        await this.searchService().indexCiphers(userId, await this.getDecryptedCipherCache());
      }
      return await this.getDecryptedCipherCache();
    }

    const decCiphers: CipherView[] = [];
    const hasKey = await this.cryptoService.hasKey();
    if (!hasKey) {
      throw new Error("No key.");
    }

    const promises: any[] = [];
    const ciphers = await this.getAll();
    ciphers.forEach(async (cipher) => {
      promises.push(cipher.decrypt().then((c) => decCiphers.push(c)));
    });

    await Promise.all(promises);
    decCiphers.sort(this.getLocaleSortingFunction());
    await this.setDecryptedCipherCache(decCiphers);
    return decCiphers;
  }

  getLocaleSortingFunction(): (a: CipherView, b: CipherView) => number {
    return (a, b) => {
      let aName = a.name;
      let bName = b.name;

      if (aName == null && bName != null) {
        return -1;
      }
      if (aName != null && bName == null) {
        return 1;
      }
      if (aName == null && bName == null) {
        return 0;
      }

      const result = this.i18nService.collator
        ? this.i18nService.collator.compare(aName, bName)
        : aName.localeCompare(bName);

      if (result !== 0 || a.type !== CipherType.Login || b.type !== CipherType.Login) {
        return result;
      }

      if (a.login.username != null) {
        aName += a.login.username;
      }

      if (b.login.username != null) {
        bName += b.login.username;
      }

      return this.i18nService.collator
        ? this.i18nService.collator.compare(aName, bName)
        : aName.localeCompare(bName);
    };
  }
}
