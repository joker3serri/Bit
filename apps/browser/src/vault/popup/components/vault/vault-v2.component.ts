import { Component, OnDestroy, OnInit } from "@angular/core";

import { VaultFilterService } from "../../../services/vault-filter.service";

@Component({
  selector: "app-vault",
  templateUrl: "vault-v2.component.html",
})
export class VaultV2Component implements OnInit, OnDestroy {
  selectedOrgId?: string;

  constructor(private vaultFilterService: VaultFilterService) {
    this.selectedOrgId = this.vaultFilterService.getVaultFilter().selectedOrganizationId;
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {}
}
