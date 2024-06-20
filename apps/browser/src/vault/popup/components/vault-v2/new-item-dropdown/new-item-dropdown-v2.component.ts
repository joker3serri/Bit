import { CommonModule } from "@angular/common";
import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router, RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CipherType } from "@bitwarden/common/vault/enums";
import { ButtonModule, MenuModule, NoItemsModule } from "@bitwarden/components";

import { VaultPopupListFiltersService } from "../../../services/vault-popup-list-filters.service";
import { AddEditQueryParams } from "../add-edit/add-edit-v2.component";

@Component({
  selector: "app-new-item-dropdown",
  templateUrl: "new-item-dropdown-v2.component.html",
  standalone: true,
  imports: [NoItemsModule, JslibModule, CommonModule, ButtonModule, RouterLink, MenuModule],
})
export class NewItemDropdownV2Component implements OnInit, OnDestroy {
  cipherType = CipherType;

  constructor(
    private router: Router,
    private vaultPopupListFilterService: VaultPopupListFiltersService,
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  private buildQueryParams(type: CipherType): AddEditQueryParams {
    const filterValue = this.vaultPopupListFilterService.filterForm.value;

    return {
      type: type.toString(),
      collectionId: filterValue.collection?.id,
      organizationId: filterValue.organization?.id || filterValue.collection?.organizationId,
      folderId: filterValue.folder?.id,
    };
  }

  newItemNavigate(type: CipherType) {
    void this.router.navigate(["/add-cipher"], { queryParams: this.buildQueryParams(type) });
  }
}
