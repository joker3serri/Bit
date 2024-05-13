import { Component, OnDestroy, OnInit } from "@angular/core";
import { Observable } from "rxjs";

import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { VaultPopupItemsService } from "../../services/vault-popup-items.service";

@Component({
  selector: "app-vault",
  templateUrl: "vault-v2.component.html",
})
export class VaultV2Component implements OnInit, OnDestroy {
  autoFillCiphers$: Observable<CipherView[]>;
  favoriteCiphers$: Observable<CipherView[]>;
  remainingCiphers$: Observable<CipherView[]>;

  constructor(private vaultPopupItemsService: VaultPopupItemsService) {}

  ngOnInit(): void {
    this.autoFillCiphers$ = this.vaultPopupItemsService.autoFillCiphers$;
    this.favoriteCiphers$ = this.vaultPopupItemsService.favoriteCiphers$;
    this.remainingCiphers$ = this.vaultPopupItemsService.remainingCiphers$;
  }

  ngOnDestroy(): void {}
}
