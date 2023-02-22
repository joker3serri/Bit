import { Component, Input } from "@angular/core";

import { CollectionView } from "@bitwarden/common/src/models/view/collection.view";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

@Component({
  selector: "app-new-vault-items",
  templateUrl: "vault-items.component.html",
})
export class VaultItemsComponent {
  @Input() items: CipherView[];
  @Input() collections: CollectionView[];
}
