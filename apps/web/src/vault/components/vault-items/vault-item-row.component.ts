import { Component, Input } from "@angular/core";

import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

@Component({
  selector: "tr[appVaultItemRow]",
  templateUrl: "vault-item-row.component.html",
})
export class VaultItemRowComponent {
  @Input() item: CipherView;
}
