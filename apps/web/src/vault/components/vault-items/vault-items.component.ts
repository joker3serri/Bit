import { Component, Input } from "@angular/core";

import { CollectionView } from "@bitwarden/common/src/models/view/collection.view";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { VaultItem } from "./vault-item";

@Component({
  selector: "app-new-vault-items",
  templateUrl: "vault-items.component.html",
  // TODO: Improve change detection, see: https://bitwarden.atlassian.net/browse/TDL-220
  // changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultItemsComponent {
  private _ciphers: CipherView[] = [];
  @Input() get ciphers(): CipherView[] {
    return this._ciphers;
  }
  set ciphers(value: CipherView[]) {
    this._ciphers = value;
    this.refreshItems();
  }

  private _collections: CollectionView[] = [];
  @Input() get collections(): CollectionView[] {
    return this._collections;
  }
  set collections(value: CollectionView[]) {
    this._collections = value;
    this.refreshItems();
  }

  protected items: VaultItem[] = [];

  private refreshItems() {
    const collections: VaultItem[] = this.collections.map((collection) => ({ collection }));
    const ciphers: VaultItem[] = this.ciphers.map((cipher) => ({ cipher }));

    this.items = [].concat(collections).concat(ciphers);
  }
}
