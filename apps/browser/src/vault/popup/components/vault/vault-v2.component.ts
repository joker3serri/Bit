import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { Icons } from "@bitwarden/components";

import { VaultPopupItemsService } from "../../services/vault-popup-items.service";

@Component({
  selector: "app-vault",
  templateUrl: "vault-v2.component.html",
})
export class VaultV2Component implements OnInit, OnDestroy {
  protected favoriteCiphers$ = this.vaultPopupItemsService.favoriteCiphers$;
  protected remainingCiphers$ = this.vaultPopupItemsService.remainingCiphers$;

  protected showEmptyState$ = this.vaultPopupItemsService.emptyVault$;
  protected showNoResultsState$ = this.vaultPopupItemsService.noFilteredResults$;

  protected vaultIcon = Icons.Vault;

  constructor(
    private vaultPopupItemsService: VaultPopupItemsService,
    private router: Router,
  ) {}

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  addCipher() {
    // TODO: Add currently filtered organization to query params if available
    void this.router.navigate(["/add-cipher"], {});
  }
}
