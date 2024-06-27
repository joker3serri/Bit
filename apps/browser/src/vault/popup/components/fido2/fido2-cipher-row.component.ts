import { Component, EventEmitter, Input, Output } from "@angular/core";

import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

@Component({
  selector: "app-fido2-cipher-row",
  templateUrl: "fido2-cipher-row.component.html",
})
export class Fido2CipherRowComponent {
  @Output() onSelected = new EventEmitter<CipherView>();
  @Input() cipher: CipherView;
  @Input() last: boolean;
  @Input() title: string;
  @Input() isSearching: boolean;
  @Input() isSelected: boolean;

  protected selectCipher(c: CipherView) {
    this.onSelected.emit(c);
  }

  protected getSubName(c: CipherView): string | null {
    const fido2Credentials = c.login?.fido2Credentials;
    
    if (!fido2Credentials || fido2Credentials.length === 0) {
        return null;
    }
    
    const [fido2Credential] = fido2Credentials;
    
    return c.name !== fido2Credential.rpId ? fido2Credential.rpId : null;
}
    if (c.login?.fido2Credentials != null && c.login.fido2Credentials.length > 0) {
      const fido2Credential = c.login.fido2Credentials[0];
      if (c.name != fido2Credential.rpId) {
        return fido2Credential.rpId;
      }
    }
    return null;
  }
}
