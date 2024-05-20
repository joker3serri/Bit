import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { SelectModule } from "@bitwarden/components";

import { VaultPopupListFilterService } from "../../../services/vault-popup-list-filters.service";

@Component({
  standalone: true,
  selector: "app-vault-list-filters",
  templateUrl: "./vault-list-filters.component.html",
  imports: [CommonModule, JslibModule, SelectModule],
})
export class VaultListFiltersComponent {
  protected cipherTypes$ = this.vaultPopupListFilterService.cipherTypes$;

  constructor(private vaultPopupListFilterService: VaultPopupListFilterService) {}
}
