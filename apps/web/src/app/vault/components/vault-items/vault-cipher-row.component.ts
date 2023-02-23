import { Component, Input } from "@angular/core";

import { Organization } from "@bitwarden/common/models/domain/organization";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

@Component({
  selector: "tr[appVaultCipherRow]",
  templateUrl: "vault-cipher-row.component.html",
})
export class VaultCipherRowComponent {
  @Input() cipher: CipherView;
  @Input() showOwner: boolean;
  @Input() showCollections: boolean;
  @Input() showGroups: boolean;
  @Input() organizations: Organization[];
}
