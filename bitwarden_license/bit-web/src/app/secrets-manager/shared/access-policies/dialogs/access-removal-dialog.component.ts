import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";

export interface AccessRemovalDetails {
  title: string;
  message: string;
}

@Component({
  selector: "sm-access-removal-dialog",
  templateUrl: "./access-removal-dialog.component.html",
})
export class AccessRemovalDialogComponent implements OnInit {
  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: AccessRemovalDetails
  ) {}

  ngOnInit(): void {
    // TODO remove null checks once strictNullChecks in TypeScript is turned on.
    if (!this.data.message || !this.data.title) {
      this.dialogRef.close();
      throw new Error(
        "The access removal dialog was not called with the appropriate operation values."
      );
    }
  }
}
