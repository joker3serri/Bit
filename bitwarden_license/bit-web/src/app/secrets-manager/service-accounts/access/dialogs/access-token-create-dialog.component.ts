import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { DialogServiceAbstraction } from "@bitwarden/angular/services/dialog";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { BitValidators } from "@bitwarden/components";

import { ServiceAccountView } from "../../../models/view/service-account.view";
import { AccessTokenView } from "../../models/view/access-token.view";
import { ServiceAccountService } from "../../service-account.service";
import { AccessService } from "../access.service";

import { AccessTokenDetails, AccessTokenDialogComponent } from "./access-token-dialog.component";

export interface AccessTokenOperation {
  organizationId: string;
  serviceAccountId: string;
}

@Component({
  templateUrl: "./access-token-create-dialog.component.html",
})
export class AccessTokenCreateDialogComponent implements OnInit {
  protected formGroup = new FormGroup({
    name: new FormControl("", {
      validators: [Validators.required, Validators.maxLength(80), BitValidators.trimValidator],
      updateOn: "submit",
    }),
    expirationDateControl: new FormControl(null),
  });
  protected loading = false;
  protected serviceAccountView: ServiceAccountView;

  expirationDayOptions = [7, 30, 60];

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: AccessTokenOperation,
    private i18nService: I18nService,
    private dialogService: DialogServiceAbstraction,
    private accessService: AccessService,
    private serviceAccountService: ServiceAccountService
  ) {}

  async ngOnInit() {
    if (!this.data.organizationId || !this.data.serviceAccountId) {
      this.dialogRef.close();
      throw new Error(
        `The access token create dialog was not called with the appropriate operation values.`
      );
    }

    this.serviceAccountView = await this.serviceAccountService.getByServiceAccountId(
      this.data.serviceAccountId,
      this.data.organizationId
    );
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
      this.data.serviceAccountId,
      accessTokenView
    );
    this.openAccessTokenDialog(this.serviceAccountView.name, accessToken, accessTokenView.expireAt);
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

  static openNewAccessTokenDialog(
    dialogService: DialogServiceAbstraction,
    serviceAccountId: string,
    organizationId: string
  ) {
    return dialogService.open<unknown, AccessTokenOperation>(AccessTokenCreateDialogComponent, {
      data: {
        organizationId: organizationId,
        serviceAccountId: serviceAccountId,
      },
    });
  }
}
