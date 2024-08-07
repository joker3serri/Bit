import { CommonModule } from "@angular/common";
import { Component, DestroyRef, inject, OnDestroy, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { RouterLink } from "@angular/router";
import { combineLatest, filter, map, Observable, shareReplay, tap } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AutofillSettingsServiceAbstraction } from "@bitwarden/common/autofill/services/autofill-settings.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { CollectionId, OrganizationId } from "@bitwarden/common/types/guid";
import { CipherType } from "@bitwarden/common/vault/enums";
import { ButtonModule, Icons, NoItemsModule, ToastService } from "@bitwarden/components";

import { CurrentAccountComponent } from "../../../../auth/popup/account-switching/current-account.component";
import { PopOutComponent } from "../../../../platform/popup/components/pop-out.component";
import { PopupHeaderComponent } from "../../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "../../../../platform/popup/layout/popup-page.component";
import { VaultPopupItemsService } from "../../services/vault-popup-items.service";
import { VaultPopupListFiltersService } from "../../services/vault-popup-list-filters.service";
import { VaultUiOnboardingService } from "../../services/vault-ui-onboarding.service";
import { AutofillVaultListItemsComponent, VaultListItemsContainerComponent } from "../vault-v2";
import {
  NewItemDropdownV2Component,
  NewItemInitialValues,
} from "../vault-v2/new-item-dropdown/new-item-dropdown-v2.component";
import { VaultListFiltersComponent } from "../vault-v2/vault-list-filters/vault-list-filters.component";
import { VaultV2SearchComponent } from "../vault-v2/vault-search/vault-v2-search.component";

enum VaultState {
  Empty,
  NoResults,
  DeactivatedOrg,
}

@Component({
  selector: "app-vault",
  templateUrl: "vault-v2.component.html",
  standalone: true,
  imports: [
    PopupPageComponent,
    PopupHeaderComponent,
    PopOutComponent,
    CurrentAccountComponent,
    NoItemsModule,
    JslibModule,
    CommonModule,
    AutofillVaultListItemsComponent,
    VaultListItemsContainerComponent,
    VaultListFiltersComponent,
    ButtonModule,
    RouterLink,
    VaultV2SearchComponent,
    NewItemDropdownV2Component,
  ],
  providers: [VaultUiOnboardingService],
})
export class VaultV2Component implements OnInit, OnDestroy {
  private destroyRef = inject(DestroyRef);
  cipherType = CipherType;

  protected favoriteCiphers$ = this.vaultPopupItemsService.favoriteCiphers$;
  protected remainingCiphers$ = this.vaultPopupItemsService.remainingCiphers$;
  protected loading$ = this.vaultPopupItemsService.loading$;

  protected newItemItemValues$: Observable<NewItemInitialValues> =
    this.vaultPopupListFiltersService.filters$.pipe(
      map((filter) => ({
        organizationId: (filter.organization?.id ||
          filter.collection?.organizationId) as OrganizationId,
        collectionId: filter.collection?.id as CollectionId,
        folderId: filter.folder?.id,
      })),
      shareReplay({ refCount: true, bufferSize: 1 }),
    );

  /** Visual state of the vault */
  protected vaultState: VaultState | null = null;

  protected vaultIcon = Icons.Vault;
  protected deactivatedIcon = Icons.DeactivatedOrg;
  protected noResultsIcon = Icons.NoResults;

  protected VaultStateEnum = VaultState;

  /** Show the autofill on page load policy toast */
  private showAutoFillOrgPolicyToast$ = combineLatest([
    this.autofillSettingsService.activateAutofillOnPageLoadFromPolicy$,
    this.autofillSettingsService.autofillOnPageLoadPolicyToastHasDisplayed$,
  ]).pipe(
    filter(([autoFillOrgPolicy, toastDisplayed]) => autoFillOrgPolicy && !toastDisplayed),
    tap(async () => {
      this.toastService.showToast({
        variant: "info",
        title: null,
        message: this.i18nService.t("autofillPageLoadPolicyActivated"),
      });

      await this.autofillSettingsService.setAutofillOnPageLoadPolicyToastHasDisplayed(true);
    }),
  );

  /** Reset the autofill on page load policy toast has displayed flag */
  private resetAutoFillOrgPolicyToastHasDisplayed$ = combineLatest([
    this.autofillSettingsService.activateAutofillOnPageLoadFromPolicy$,
    this.autofillSettingsService.autofillOnPageLoadPolicyToastHasDisplayed$,
  ]).pipe(
    filter(([autoFillOrgPolicy, toastDisplayed]) => !autoFillOrgPolicy && toastDisplayed),
    tap(async () => {
      await this.autofillSettingsService.setAutofillOnPageLoadPolicyToastHasDisplayed(false);
    }),
  );

  constructor(
    private vaultPopupItemsService: VaultPopupItemsService,
    private vaultPopupListFiltersService: VaultPopupListFiltersService,
    private vaultUiOnboardingService: VaultUiOnboardingService,
    private autofillSettingsService: AutofillSettingsServiceAbstraction,
    private toastService: ToastService,
    private i18nService: I18nService,
  ) {
    combineLatest([
      this.vaultPopupItemsService.emptyVault$,
      this.vaultPopupItemsService.noFilteredResults$,
      this.vaultPopupItemsService.showDeactivatedOrg$,
    ])
      .pipe(takeUntilDestroyed())
      .subscribe(([emptyVault, noResults, deactivatedOrg]) => {
        switch (true) {
          case emptyVault:
            this.vaultState = VaultState.Empty;
            break;
          case deactivatedOrg:
            // The deactivated org state takes precedence over the no results state
            this.vaultState = VaultState.DeactivatedOrg;
            break;
          case noResults:
            this.vaultState = VaultState.NoResults;
            break;
          default:
            this.vaultState = null;
        }
      });
  }

  async ngOnInit() {
    await this.vaultUiOnboardingService.showOnboardingDialog();

    this.showAutoFillOrgPolicyToast$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe();
    this.resetAutoFillOrgPolicyToastHasDisplayed$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe();
  }

  ngOnDestroy(): void {}
}
