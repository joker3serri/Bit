import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { map } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { SelectModule } from "@bitwarden/components";

import { VaultPopupListFiltersService } from "../../../services/vault-popup-list-filters.service";

@Component({
  standalone: true,
  selector: "app-vault-list-filters",
  templateUrl: "./vault-list-filters.component.html",
  imports: [CommonModule, JslibModule, SelectModule],
})
export class VaultListFiltersComponent {
  protected cipherTypes$ = this.vaultPopupListFiltersService.cipherTypes$;
  protected organizations$ = this.vaultPopupListFiltersService.organizations$;
  protected collections$ = this.vaultPopupListFiltersService.collections$.pipe(
    map((collections) => collections.fullList),
  );

  protected allFolders$ = this.vaultPopupListFiltersService.folders$.pipe(
    map((nestedFolders) => {
      return nestedFolders.fullList.filter((folder) => folder.id !== null);
    }),
  );

  constructor(private vaultPopupListFiltersService: VaultPopupListFiltersService) {}
}
