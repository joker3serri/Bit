import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { SearchService } from "@bitwarden/common/abstractions/search.service";
import { SettingsService } from "@bitwarden/common/abstractions/settings.service";
import { CipherType } from "@bitwarden/common/enums/cipherType";
import { UriMatchType } from "@bitwarden/common/enums/uriMatchType";
import { UrlUtils } from "@bitwarden/common/misc/utilities/urlUtils";
import { SortedCiphersCache } from "@bitwarden/common/models/domain/sortedCiphersCache";
import { CipherView } from "@bitwarden/common/models/view/cipherView";

import { StateService } from "src/services/abstractions/state.service";
import I18nService from "src/services/i18n.service";

import { GetAllDecryptedCiphersCommand } from "./getAllDecryptedCiphersCommand";

const DomainMatchBlacklist = new Map<string, Set<string>>([
  ["google.com", new Set(["script.google.com"])],
]);

export class GetAllDecryptedCiphersForUrlCommand extends GetAllDecryptedCiphersCommand {
  constructor(
    protected settingsService: SettingsService,
    protected logService: LogService,
    stateService: StateService,
    cryptoService: CryptoService,
    i18nService: I18nService,
    searchService: () => SearchService
  ) {
    super(stateService, cryptoService, i18nService, searchService);
  }

  protected sortedCiphersCache: SortedCiphersCache = new SortedCiphersCache(
    this.sortCiphersByLastUsed
  );

  async getAllDecryptedForUrl(
    url: string,
    includeOtherTypes?: CipherType[],
    defaultMatch: UriMatchType = null
  ): Promise<CipherView[]> {
    if (url == null && includeOtherTypes == null) {
      return Promise.resolve([]);
    }

    const domain = UrlUtils.getDomain(url);
    const eqDomainsPromise =
      domain == null
        ? Promise.resolve([])
        : this.settingsService.getEquivalentDomains().then((eqDomains: any[][]) => {
            let matches: any[] = [];
            eqDomains.forEach((eqDomain) => {
              if (eqDomain.length && eqDomain.indexOf(domain) >= 0) {
                matches = matches.concat(eqDomain);
              }
            });

            if (!matches.length) {
              matches.push(domain);
            }

            return matches;
          });

    const result = await Promise.all([eqDomainsPromise, this.getAllDecrypted()]);
    const matchingDomains = result[0];
    const ciphers = result[1];

    if (defaultMatch == null) {
      defaultMatch = await this.stateService.getDefaultUriMatch();
      if (defaultMatch == null) {
        defaultMatch = UriMatchType.Domain;
      }
    }

    return ciphers.filter((cipher) => {
      if (cipher.deletedDate != null) {
        return false;
      }
      if (includeOtherTypes != null && includeOtherTypes.indexOf(cipher.type) > -1) {
        return true;
      }

      if (url != null && cipher.type === CipherType.Login && cipher.login.uris != null) {
        for (let i = 0; i < cipher.login.uris.length; i++) {
          const u = cipher.login.uris[i];
          if (u.uri == null) {
            continue;
          }

          const match = u.match == null ? defaultMatch : u.match;
          switch (match) {
            case UriMatchType.Domain:
              if (domain != null && u.domain != null && matchingDomains.indexOf(u.domain) > -1) {
                if (DomainMatchBlacklist.has(u.domain)) {
                  const domainUrlHost = UrlUtils.getHost(url);
                  if (!DomainMatchBlacklist.get(u.domain).has(domainUrlHost)) {
                    return true;
                  }
                } else {
                  return true;
                }
              }
              break;
            case UriMatchType.Host: {
              const urlHost = UrlUtils.getHost(url);
              if (urlHost != null && urlHost === UrlUtils.getHost(u.uri)) {
                return true;
              }
              break;
            }
            case UriMatchType.Exact:
              if (url === u.uri) {
                return true;
              }
              break;
            case UriMatchType.StartsWith:
              if (url.startsWith(u.uri)) {
                return true;
              }
              break;
            case UriMatchType.RegularExpression:
              try {
                const regex = new RegExp(u.uri, "i");
                if (regex.test(url)) {
                  return true;
                }
              } catch (e) {
                this.logService.error(e);
              }
              break;
            case UriMatchType.Never:
            default:
              break;
          }
        }
      }

      return false;
    });
  }

  sortCiphersByLastUsed(a: CipherView, b: CipherView): number {
    const aLastUsed =
      a.localData && a.localData.lastUsedDate ? (a.localData.lastUsedDate as number) : null;
    const bLastUsed =
      b.localData && b.localData.lastUsedDate ? (b.localData.lastUsedDate as number) : null;

    const bothNotNull = aLastUsed != null && bLastUsed != null;
    if (bothNotNull && aLastUsed < bLastUsed) {
      return 1;
    }
    if (aLastUsed != null && bLastUsed == null) {
      return -1;
    }

    if (bothNotNull && aLastUsed > bLastUsed) {
      return -1;
    }
    if (bLastUsed != null && aLastUsed == null) {
      return 1;
    }

    return 0;
  }

  private async clearEncryptedCiphersState(userId?: string) {
    await this.stateService.setEncryptedCiphers(null, { userId: userId });
  }

  private async clearDecryptedCiphersState(userId?: string) {
    await this.stateService.setDecryptedCiphers(null, { userId: userId });
    this.clearSortedCiphers();
  }

  private clearSortedCiphers() {
    this.sortedCiphersCache.clear();
  }
}
