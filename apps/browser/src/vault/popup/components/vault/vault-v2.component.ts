import { Component, OnDestroy, OnInit } from "@angular/core";
import { Router } from "@angular/router";

import { VaultFilter } from "@bitwarden/angular/vault/vault-filter/models/vault-filter.model";

import { VaultFilterService } from "../../../services/vault-filter.service";

@Component({
  selector: "app-vault",
  templateUrl: "vault-v2.component.html",
})
export class VaultV2Component implements OnInit, OnDestroy {
  vaultFilter: VaultFilter;

  constructor(
    private router: Router,
    private vaultFilterService: VaultFilterService,
  ) {
    this.vaultFilter = this.vaultFilterService.getVaultFilter();
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}

  addCipher() {
    // eslint-disable-next-line @typescript-eslint/no-floating-promises
    this.router.navigate(["/add-cipher"], {
      queryParams: { selectedVault: this.vaultFilter.selectedOrganizationId },
    });
  }
}
