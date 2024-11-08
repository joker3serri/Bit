import { CommonModule } from "@angular/common";
import { AfterViewInit, Component, ViewChild } from "@angular/core";
import { combineLatest, distinctUntilChanged, firstValueFrom, map, shareReplay } from "rxjs";

import {
  KeyDefinition,
  StateProvider,
  VAULT_SETTINGS_DISK,
} from "@bitwarden/common/platform/state";
import { DisclosureTriggerForDirective, IconButtonModule } from "@bitwarden/components";

import { DisclosureComponent } from "../../../../../../../../libs/components/src/disclosure/disclosure.component";
import { VaultPopupListFiltersService } from "../../../../../vault/popup/services/vault-popup-list-filters.service";
import { VaultListFiltersComponent } from "../vault-list-filters/vault-list-filters.component";
import { VaultV2SearchComponent } from "../vault-search/vault-v2-search.component";

const FILTER_VISIBILITY_KEY = new KeyDefinition<boolean>(VAULT_SETTINGS_DISK, "filterVisibility", {
  deserializer: (obj) => obj,
});

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
export class VaultHeaderV2Component implements AfterViewInit {
  @ViewChild(DisclosureComponent) disclosure: DisclosureComponent;

  /** Stored state for the visibility of the filters. */
  private filterVisibilityState = this.stateProvider.getGlobal(FILTER_VISIBILITY_KEY);

  /** Emits the visibility status of the disclosure component. */
  protected isDisclosureShown$ = this.filterVisibilityState.state$.pipe(
    distinctUntilChanged(),
    map((visibility) => visibility ?? true),
  );

  /** Emits the number of applied filters. */
  protected numberOfFilters$ = this.vaultPopupListFiltersService.filters$.pipe(
    map((filters) => Object.values(filters).filter((filter) => Boolean(filter)).length),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  /** Emits true when the number of filters badge should be applied. */
  protected showBadge$ = combineLatest([this.numberOfFilters$, this.isDisclosureShown$]).pipe(
    map(([numberOfFilters, disclosureShown]) => numberOfFilters !== 0 && !disclosureShown),
  );

  constructor(
    private vaultPopupListFiltersService: VaultPopupListFiltersService,
    private stateProvider: StateProvider,
  ) {}

  async ngAfterViewInit(): Promise<void> {
    const isDisclosureShown = await firstValueFrom(this.isDisclosureShown$);
    this.disclosure.open = isDisclosureShown;
  }

  /** Updates the local status of the disclosure */
  protected async disclosureVisibilityChange(isVisible: boolean) {
    await this.filterVisibilityState.update(() => isVisible);
  }
}
