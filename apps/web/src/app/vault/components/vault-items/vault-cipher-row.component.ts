import { Component, EventEmitter, Input, Output } from "@angular/core";

import { Organization } from "@bitwarden/common/models/domain/organization";
import { CollectionView } from "@bitwarden/common/models/view/collection.view";
import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { VaultItemEvent } from "./vault-item-event";

@Component({
  selector: "tr[appVaultCipherRow]",
  templateUrl: "vault-cipher-row.component.html",
})
export class VaultCipherRowComponent {
  @Input() cipher: CipherView;
  @Input() showOwner: boolean;
  @Input() showCollections: boolean;
  @Input() showGroups: boolean;
  @Input() showPremiumFeatures: boolean;
  @Input() cloneable: boolean;
  @Input() organizations: Organization[];
  @Input() collections: CollectionView[];

  @Output() onEvent = new EventEmitter<VaultItemEvent>();

  protected CipherType = CipherType;

  protected get showTotpCopyButton() {
    return (
      (this.cipher.login?.hasTotp ?? false) &&
      (this.cipher.organizationUseTotp || this.showPremiumFeatures)
    );
  }

  protected get showFixOldAttachments() {
    return this.cipher.hasOldAttachments && this.cipher.organizationId == null;
  }

  protected copy(field: "username" | "password" | "totp") {
    this.onEvent.emit({ type: "copy", item: this.cipher, field });
  }

  protected clone() {
    this.onEvent.emit({ type: "clone", item: this.cipher });
  }

  protected moveToOrganization() {
    this.onEvent.emit({ type: "moveToOrganization", item: [this.cipher] });
  }

  protected attachments() {
    this.onEvent.emit({ type: "attachements", item: this.cipher });
  }
}
