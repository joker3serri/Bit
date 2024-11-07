import { NgClass } from "@angular/common";
import { Component } from "@angular/core";

import { DisclosureTriggerForDirective, IconButtonModule } from "@bitwarden/components";

import { DisclosureComponent } from "../../../../../../../../libs/components/src/disclosure/disclosure.component";
import { VaultListFiltersComponent } from "../vault-list-filters/vault-list-filters.component";
import { VaultV2SearchComponent } from "../vault-search/vault-v2-search.component";

@Component({
  selector: "app-vault-header-v2",
  templateUrl: "vault-header-v2.component.html",
  standalone: true,
  imports: [
    VaultV2SearchComponent,
    VaultListFiltersComponent,
    DisclosureComponent,
    IconButtonModule,
    DisclosureTriggerForDirective,
    NgClass,
  ],
})
export class VaultHeaderV2Component {}
