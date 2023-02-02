import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

export interface SMImportErrorDialogOperation {
  error: Error;
}

@Component({
  selector: "sm-import-error-dialog",
  templateUrl: "./import-error-dialog.component.html",
})
export class SMImportErrorDialogComponent implements OnInit {
  constructor(
    public dialogRef: DialogRef,
    private i18nService: I18nService,
    @Inject(DIALOG_DATA) public data: SMImportErrorDialogOperation
  ) {}

  ngOnInit(): void {
    if (this.data.error == undefined || this.data.error == null) {
      this.dialogRef.close();
      throw new Error(
        "The SM import error dialog was not called with the appropriate operation values."
      );
    }
  }
}
