import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { BadgeModule, ButtonModule, IconButtonModule, ItemModule } from "@bitwarden/components";

@Component({
  imports: [CommonModule, JslibModule, ItemModule, ButtonModule, BadgeModule, IconButtonModule],
  standalone: true,
  selector: "app-vault-list-item",
  templateUrl: "vault-list-item.component.html",
})
export class VaultListItemComponent {
  @Input()
  cipher: CipherView;

  @Input()
  showAutoFill: boolean;

  constructor(private router: Router) {}

  async openCipher() {
    await this.router.navigate(["/view-cipher"], { queryParams: { cipherId: this.cipher.id } });
  }
}
