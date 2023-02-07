import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

export interface SMImportErrorDialogOperation {
  error: Error;
}

class ErrorInfo {
  name: string;
  description: string;
}

@Component({
  selector: "sm-import-error-dialog",
  templateUrl: "./import-error-dialog.component.html",
})
export class SMImportErrorDialogComponent implements OnInit {
  errorInfoList: ErrorInfo[];

  constructor(
    public dialogRef: DialogRef,
    private i18nService: I18nService,
    @Inject(DIALOG_DATA) public data: SMImportErrorDialogOperation
  ) {}

  ngOnInit(): void {
    try {
      this.errorInfoList = this.parseError(this.data.error);
    } catch {
      this.dialogRef.close();
    }
  }

  parseError(error: Error): ErrorInfo[] {
    const result: ErrorInfo[] = [];
    const errors = error.message.split("\n\n");
    errors.forEach((line, index) => {
      const lineContents = line.split(":");
      result.push({
        name: lineContents[0].trim(),
        description: lineContents[1].trim(),
      });
    });

    return result;
  }
}
