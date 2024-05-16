import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { BadgeModule, ButtonModule, IconButtonModule, ItemModule } from "@bitwarden/components";

@Component({
  imports: [
    CommonModule,
    JslibModule,
    ItemModule,
    ButtonModule,
    BadgeModule,
    IconButtonModule,
    RouterLink,
  ],
  standalone: true,
  selector: "app-vault-list-item",
  templateUrl: "vault-list-item.component.html",
})
export class VaultListItemComponent {
  @Input()
  cipher: CipherView;

  @Input()
  showAutoFill: boolean;

  constructor() {}
}
