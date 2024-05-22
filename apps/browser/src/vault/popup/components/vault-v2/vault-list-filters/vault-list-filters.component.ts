import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { SelectModule } from "@bitwarden/components";

import { VaultPopupListFilterService } from "../../../services/vault-popup-list-filters.service";
import { map } from "rxjs";

@Component({
  standalone: true,
  selector: "app-vault-list-filters",
  templateUrl: "./vault-list-filters.component.html",
  imports: [CommonModule, JslibModule, SelectModule],
})
export class VaultListFiltersComponent {
  protected cipherTypes$ = this.vaultPopupListFilterService.cipherTypes$;
  protected allFolders$ = this.vaultPopupListFilterService.nestedFolders$.pipe(
    map((nestedFolders) => {
      return nestedFolders.fullList.filter((folder) => folder.id !== null);
    }),
  );
  hasFolders$ = this.allFolders$.pipe(map((folders) => folders.length > 0));

  constructor(private vaultPopupListFilterService: VaultPopupListFilterService) {
    this.vaultPopupListFilterService.nestedFolders$.subscribe((folders) => {
      console.log({ folders });
    });
  }
}
