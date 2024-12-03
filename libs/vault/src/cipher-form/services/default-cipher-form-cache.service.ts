import { inject, Injectable } from "@angular/core";

import { ViewCacheService } from "@bitwarden/angular/platform/abstractions/view-cache.service";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

const POPUP_CIPHER_CACHE_KEY = "popup-cipher-cache";

@Injectable()
export class CipherFormCacheService {
  private popupViewCacheService: ViewCacheService = inject(ViewCacheService);

  private cipherCache = this.popupViewCacheService.signal<CipherView | null>({
    key: POPUP_CIPHER_CACHE_KEY,
    initialValue: null,
    deserializer: (obj) => (obj ? CipherView.fromJSON(obj) : null),
  });

  /**
   * Update the cache with the new CipherView.
   */
  cacheCipherView(cipherView: CipherView): void {
    // Create a new shallow reference to force the signal to update
    this.cipherCache.set({ ...cipherView } as CipherView);
  }

  /**
   * Returns the cached CipherView when available.
   */
  getCachedCipherView(): CipherView | null {
    return this.cipherCache();
  }
}
