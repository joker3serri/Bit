import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import {
  AbstractControl,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from "@angular/forms";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
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
    name: new FormControl("", [Validators.required]),
    expires: new FormControl("", [Validators.required]),
    expireDateTime: new FormControl("", [this.customRequireDateTimeValidator()]),
  });
  protected loading = false;

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: AccessTokenOperation,
    private i18nService: I18nService,
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
    accessTokenView.expireAt = this.getExpiresDate();
    const accessToken = await this.accessService.createAccessToken(
      this.data.organizationId,
      this.data.serviceAccountView.id,
      accessTokenView
    );
    this.openAccessTokenDialog("prod pipeline", accessToken, accessTokenView.expireAt);
    this.dialogRef.close();
  };

  private getExpiresDate(): Date {
    const currentDate = new Date();
    switch (this.formGroup.value.expires) {
      case "sevenDays":
        currentDate.setDate(currentDate.getDate() + 7);
        return currentDate;
      case "thirtyDays":
        currentDate.setDate(currentDate.getDate() + 30);
        return currentDate;
      case "sixtyDays":
        currentDate.setDate(currentDate.getDate() + 30);
        return currentDate;
      case "custom":
        return new Date(this.formGroup.value.expireDateTime);
    }
  }

  private openAccessTokenDialog(
    serviceAccountName: string,
    accessToken: string,
    expirationDate: Date
  ) {
    this.dialogService.open<unknown, AccessTokenDetails>(AccessTokenDialogComponent, {
      data: {
        subTitle: serviceAccountName,
        expirationDate: expirationDate,
        accessToken: accessToken,
      },
    });
  }

  private customRequireDateTimeValidator(): ValidatorFn {
    return (control: AbstractControl): ValidationErrors | null => {
      if (
        this.formGroup?.value?.expires !== "custom" ||
        (this.formGroup.value.expires === "custom" && control.value)
      ) {
        return null;
      } else {
        return {
          confirmationDoesntMatchError: {
            message: this.i18nService.t("accessTokenExpirationRequired"),
          },
        };
      }
    };
  }
}
