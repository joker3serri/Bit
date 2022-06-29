import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { SettingsService } from "@bitwarden/common/abstractions/settings.service";
import { CipherView } from "@bitwarden/common/models/view/cipherView";

import { StateService } from "src/services/abstractions/state.service";
import I18nService from "src/services/i18n.service";

import { GetAllDecryptedCiphersForUrlCommand } from "./getAllDecryptedCiphersForUrlCommand";

export class GetNextCipherForUrlCommand extends GetAllDecryptedCiphersForUrlCommand {
  constructor(
    settingsService: SettingsService,
    logService: LogService,
    stateService: StateService,
    cryptoService: CryptoService,
    i18nService: I18nService,
    searchService: () => SearchService
  ) {
    super(settingsService, logService, stateService, cryptoService, i18nService, searchService);
  }

  async getNextCipherForUrl(url: string): Promise<CipherView> {
    return this.getCipherForUrl(url, false, false, false);
  }

  private async getCipherForUrl(
    url: string,
    lastUsed: boolean,
    lastLaunched: boolean,
    autofillOnPageLoad: boolean
  ): Promise<CipherView> {
    const cacheKey = autofillOnPageLoad ? "autofillOnPageLoad-" + url : url;

    if (!this.sortedCiphersCache.isCached(cacheKey)) {
      let ciphers = await this.getAllDecryptedForUrl(url);
      if (!ciphers) {
        return null;
      }

      if (autofillOnPageLoad) {
        const autofillOnPageLoadDefault = await this.stateService.getAutoFillOnPageLoadDefault();
        ciphers = ciphers.filter(
          (cipher) =>
            cipher.login.autofillOnPageLoad ||
            (cipher.login.autofillOnPageLoad == null && autofillOnPageLoadDefault !== false)
        );
        if (ciphers.length === 0) {
          return null;
        }
      }

      this.sortedCiphersCache.addCiphers(cacheKey, ciphers);
    }

    if (lastLaunched) {
      return this.sortedCiphersCache.getLastLaunched(cacheKey);
    } else if (lastUsed) {
      return this.sortedCiphersCache.getLastUsed(cacheKey);
    } else {
      return this.sortedCiphersCache.getNext(cacheKey);
    }
  }
}
