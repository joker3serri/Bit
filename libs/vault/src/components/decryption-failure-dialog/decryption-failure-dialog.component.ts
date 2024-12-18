import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { Component, inject } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CipherId } from "@bitwarden/common/types/guid";
import {
  AsyncActionsModule,
  ButtonModule,
  DialogModule,
  DialogService,
  TypographyModule,
} from "@bitwarden/components";

export type DecryptionFailureDialogParams = {
  cipherIds: CipherId[];
};

@Component({
  standalone: true,
  selector: "vault-decryption-failure-dialog",
  templateUrl: "./decryption-failure-dialog.component.html",
  imports: [
    DialogModule,
    CommonModule,
    TypographyModule,
    JslibModule,
    AsyncActionsModule,
    ButtonModule,
  ],
})
export class DecryptionFailureDialogComponent {
  protected dialogRef = inject(DialogRef);
  protected params = inject<DecryptionFailureDialogParams>(DIALOG_DATA);

  selectText(element: HTMLElement) {
    const selection = window.getSelection();
    if (selection == null) {
      return;
    }
    selection.removeAllRanges();
    const range = document.createRange();
    range.selectNodeContents(element);
    selection.addRange(range);
  }

  static open(dialogService: DialogService, params: DecryptionFailureDialogParams) {
    return dialogService.open(DecryptionFailureDialogComponent, { data: params });
  }
}
