import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { DialogService } from "@bitwarden/components";

import { ServiceAccountView } from "../../../models/view/service-account.view";
import { AccessTokenView } from "../../models/view/access-token.view";
import { AccessService } from "../access.service";

import { AccessTokenDetails, AccessTokenDialogComponent } from "./access-token-dialog.component";

export interface AccessTokenOperation {
  organizationId: string;
  serviceAccountView: ServiceAccountView;
}

@Component({
  selector: "sm-access-token-create-dialog",
  templateUrl: "./access-token-create-dialog.component.html",
})
export class AccessTokenCreateDialogComponent implements OnInit {
  protected formGroup = new FormGroup({
    name: new FormControl("", [Validators.required, Validators.maxLength(80)]),
    expirationDateControl: new FormControl(null),
  });
  protected loading = false;

  expirationDayOptions = [7, 30, 60];

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: AccessTokenOperation,
    private dialogService: DialogService,
    private accessService: AccessService
  ) {}

  async ngOnInit() {
    if (
      !this.data.organizationId ||
      !this.data.serviceAccountView?.id ||
      !this.data.serviceAccountView?.name
    ) {
      this.dialogRef.close();
      throw new Error(
        `The access token create dialog was not called with the appropriate operation values.`
      );
    }
  }

  submit = async () => {
    this.formGroup.markAllAsTouched();
    if (this.formGroup.invalid) {
      return;
    }
    const accessTokenView = new AccessTokenView();
    accessTokenView.name = this.formGroup.value.name;
    accessTokenView.expireAt = this.formGroup.value.expirationDateControl;
    const accessToken = await this.accessService.createAccessToken(
      this.data.organizationId,
      this.data.serviceAccountView.id,
      accessTokenView
    );
    this.openAccessTokenDialog(
      this.data.serviceAccountView.name,
      accessToken,
      accessTokenView.expireAt
    );
    this.dialogRef.close();
  };

  private openAccessTokenDialog(
    serviceAccountName: string,
    accessToken: string,
    expirationDate?: Date
  ) {
    this.dialogService.open<unknown, AccessTokenDetails>(AccessTokenDialogComponent, {
      data: {
        subTitle: serviceAccountName,
        expirationDate: expirationDate,
        accessToken: accessToken,
      },
    });
  }
}
