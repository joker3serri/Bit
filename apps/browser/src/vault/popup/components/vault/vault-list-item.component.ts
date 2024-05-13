import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { Router } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { BadgeModule, ButtonModule, IconButtonModule, ItemModule } from "@bitwarden/components";

@Component({
  imports: [CommonModule, JslibModule, ItemModule, ButtonModule, BadgeModule, IconButtonModule],
  standalone: true,
  selector: "app-vault-list-item",
  template: `
    <bit-item>
      <button bit-item-content (click)="openCipher()">
        <app-vault-icon slot="start" [cipher]="cipher"></app-vault-icon>
        {{ cipher.name }}
        <span slot="secondary">{{ cipher.subTitle }}</span>
      </button>
      <ng-container slot="end">
        <bit-item-action *ngIf="showAutoFill">
          <button type="button" bitBadge variant="primary">Auto-fill</button>
        </bit-item-action>
        <bit-item-action>
          <button type="button" bitIconButton="bwi-clone"></button>
        </bit-item-action>
        <bit-item-action>
          <button type="button" bitIconButton="bwi-ellipsis-v"></button>
        </bit-item-action>
      </ng-container>
    </bit-item>
  `,
})
export class VaultListItemComponent {
  @Input()
  cipher: CipherView;

  @Input()
  showAutoFill: boolean;

  constructor(private router: Router) {}

  async openCipher() {
    await this.router.navigate(["/view-cipher"], { queryParams: { cipherId: this.cipher.id } });
  }
}
