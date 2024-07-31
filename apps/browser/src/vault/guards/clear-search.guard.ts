import { inject } from "@angular/core";
import { CanDeactivateFn } from "@angular/router";

import { VaultV2Component } from "../popup/components/vault/vault-v2.component";
import { VaultPopupItemsService } from "../popup/services/vault-popup-items.service";

export const clearVaultSearchGuard: CanDeactivateFn<VaultV2Component> = (
  component: VaultV2Component,
  currentRoute,
  currentState,
  nextState,
) => {
  const vaultPopupItemsService = inject(VaultPopupItemsService);
  if (nextState && !isViewingCipher(nextState.url)) {
    vaultPopupItemsService.applyFilter("");
  }

  return true;
};

const isViewingCipher = (url: string): boolean => url.includes("view-cipher");
