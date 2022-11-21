import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";

export interface AccessTokenDetails {
  subTitle: string;
  expirationDate: Date;
  accessToken: string;
}

@Component({
  selector: "sm-access-token-dialog",
  templateUrl: "./access-token-dialog.component.html",
})
export class AccessTokenDialogComponent implements OnInit {
  constructor(public dialogRef: DialogRef, @Inject(DIALOG_DATA) public data: AccessTokenDetails) {}

  ngOnInit(): void {
    // TODO remove null checks once strictNullChecks in TypeScript is turned on.
    if (!this.data.subTitle || !this.data.expirationDate || !this.data.accessToken) {
      this.dialogRef.close();
      throw new Error("The access token dialog was not called with the appropriate values.");
    }
  }

  copyAccessToken(): void {
    // TODO copy accessToken to clipboard
    this.dialogRef.close();
  }
}
