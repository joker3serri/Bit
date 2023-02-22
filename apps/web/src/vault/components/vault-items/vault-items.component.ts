import { ChangeDetectionStrategy, Component, Input } from "@angular/core";

import { CollectionView } from "@bitwarden/common/src/models/view/collection.view";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

@Component({
  selector: "app-new-vault-items",
  templateUrl: "vault-items.component.html",
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class VaultItemsComponent {
  @Input() ciphers: CipherView[];
  @Input() collections: CollectionView[];
}
