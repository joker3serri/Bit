import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { CollectionView } from "@bitwarden/common/src/models/view/collection.view";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { VaultItem } from "./vault-item";

@Component({
  selector: "app-new-vault-items",
  templateUrl: "vault-items.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultItemsComponent {
  @Input() ciphers: CipherView[] = [];
  @Input() collections: CollectionView[] = [];

  protected get items(): VaultItem[] {
    const collections: VaultItem[] = this.collections.map((collection) => ({ collection }));
    const ciphers: VaultItem[] = this.ciphers.map((cipher) => ({ cipher }));

    return [].concat(collections).concat(ciphers);
  }
}
