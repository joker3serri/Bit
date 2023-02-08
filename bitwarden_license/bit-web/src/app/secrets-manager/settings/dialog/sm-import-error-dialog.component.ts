import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { SecretsManagerImportError } from "../models/error/sm-import-error";
import { SecretsManagerImportErrorLine } from "../models/error/sm-import-error-line";

export interface SMImportErrorDialogOperation {
  error: SecretsManagerImportError;
}

@Component({
  selector: "sm-import-error-dialog",
  templateUrl: "./import-error-dialog.component.html",
})
export class SMImportErrorDialogComponent {
  errorLines: SecretsManagerImportErrorLine[];

  constructor(
    public dialogRef: DialogRef,
    private i18nService: I18nService,
    @Inject(DIALOG_DATA) public data: SMImportErrorDialogOperation
  ) {
    this.errorLines = data.error.lines;
  }
}
