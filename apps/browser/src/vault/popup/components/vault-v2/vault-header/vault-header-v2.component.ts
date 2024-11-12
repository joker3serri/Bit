import { CommonModule } from "@angular/common";
import { ChangeDetectorRef, Component, DestroyRef, inject, OnInit, ViewChild } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { BehaviorSubject, combineLatest, first, map, shareReplay } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
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
    JslibModule,
  ],
})
export class VaultHeaderV2Component implements OnInit {
  @ViewChild(DisclosureComponent) disclosure: DisclosureComponent;

  /** Stored state for the visibility of the filters. */
  private filterVisibilityState = this.stateProvider.getGlobal(FILTER_VISIBILITY_KEY);

  /** Emits the visibility status of the disclosure component. */
  protected isDisclosureShown$ = new BehaviorSubject<boolean | null>(null);

  /** Emits the number of applied filters. */
  protected numberOfFilters$ = this.vaultPopupListFiltersService.filters$.pipe(
    map((filters) => Object.values(filters).filter((filter) => Boolean(filter)).length),
    shareReplay({ refCount: true, bufferSize: 1 }),
  );

  /** Emits true when the number of filters badge should be applied. */
  protected showBadge$ = combineLatest([this.numberOfFilters$, this.isDisclosureShown$]).pipe(
    map(([numberOfFilters, disclosureShown]) => numberOfFilters !== 0 && !disclosureShown),
  );

  protected buttonSupportingText$ = this.numberOfFilters$.pipe(
    map((numberOfFilters) => {
      if (numberOfFilters === 0) {
        return null;
      }
      if (numberOfFilters === 1) {
        return this.i18nService.t("filterApplied");
      }

      return this.i18nService.t("filterAppliedPlural", numberOfFilters);
    }),
  );

  private destroyRef = inject(DestroyRef);

  constructor(
    private vaultPopupListFiltersService: VaultPopupListFiltersService,
    private stateProvider: StateProvider,
    private i18nService: I18nService,
    private changeDetectorRef: ChangeDetectorRef,
  ) {}

  ngOnInit(): void {
    // Get the initial visibility from stored state
    this.filterVisibilityState.state$
      .pipe(
        first(),
        takeUntilDestroyed(this.destroyRef),
        map((visibility) => visibility ?? true),
      )
      .subscribe((showFilters) => {
        this.disclosure.open = showFilters;
        this.disclosureVisibility(showFilters);
        // Force change detection after updating from state,
        // avoids `ExpressionChangedAfterItHasBeenCheckedError`.
        this.changeDetectorRef.detectChanges();
      });
  }

  protected disclosureVisibility(isShown: boolean) {
    // If local state is already up to date with the disclosure, exit early.
    if (this.isDisclosureShown$.value === isShown) {
      return;
    }

    this.isDisclosureShown$.next(isShown);
    void this.filterVisibilityState.update(() => isShown);
  }
}
