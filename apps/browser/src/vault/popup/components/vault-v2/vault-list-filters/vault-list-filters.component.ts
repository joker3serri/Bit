import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CipherType } from "@bitwarden/common/vault/enums";
import { SelectModule } from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "app-vault-list-filters",
  templateUrl: "./vault-list-filters.component.html",
  imports: [CommonModule, JslibModule, SelectModule],
})
export class VaultListFiltersComponent {
  protected readonly cipherTypes = [
    {
      value: CipherType.Login,
      label: "logins",
      icon: "bwi-globe",
    },
    {
      value: CipherType.Card,
      label: "cards",
      icon: "bwi-credit-card",
    },
    {
      value: CipherType.Identity,
      label: "identities",
      icon: "bwi-id-card",
    },
    {
      value: CipherType.SecureNote,
      label: "notes",
      icon: "bwi-sticky-note",
    },
  ];
}
