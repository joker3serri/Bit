import { CommonModule } from "@angular/common";
import { Component, ViewChild } from "@angular/core";
import { BehaviorSubject, combineLatest, map, shareReplay } from "rxjs";

import { DisclosureTriggerForDirective, IconButtonModule } from "@bitwarden/components";

import { DisclosureComponent } from "../../../../../../../../libs/components/src/disclosure/disclosure.component";
import { VaultPopupListFiltersService } from "../../../../../vault/popup/services/vault-popup-list-filters.service";
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
    CommonModule,
  ],
})
export class VaultHeaderV2Component {
  @ViewChild(DisclosureComponent) disclosure: DisclosureComponent;

  /**
   * Emits the visibility status of the disclosure component.
   *
   * Note: defaults to `true` to match the default state in the template.
   */
  private isDisclosureShown$ = new BehaviorSubject<boolean>(true);

  /**
   * Emits the number of applied filters.
   */
  protected numberOfFilters$ = this.vaultPopupListFiltersService.filters$.pipe(
    map((filters) => Object.values(filters).filter((filter) => Boolean(filter)).length),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  /**
   * Emits true when the number of filters badge should be applied.
   */
  protected showBadge$ = combineLatest([this.numberOfFilters$, this.isDisclosureShown$]).pipe(
    map(([numberOfFilters, disclosureShown]) => numberOfFilters !== 0 && !disclosureShown),
  );

  constructor(private vaultPopupListFiltersService: VaultPopupListFiltersService) {}

  /** Updates the local status of the disclosure */
  protected disclosureVisibilityChange(isVisible: boolean) {
    this.isDisclosureShown$.next(isVisible);
  }
}
