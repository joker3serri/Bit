import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";

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
  private destroy$ = new Subject<void>();
  protected formGroup = new FormGroup({
    name: new FormControl("", [Validators.required]),
    expires: new FormControl("", [Validators.required]),
    expireDateTime: new FormControl(""),
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

    this.formGroup
      .get("expires")
      .valueChanges.pipe(takeUntil(this.destroy$))
      .subscribe((value) => {
        if (value == "custom") {
          this.formGroup.get("expireDateTime").setValidators(Validators.required);
        } else {
          this.formGroup.get("expireDateTime").clearValidators();
          this.formGroup.get("expireDateTime").updateValueAndValidity();
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
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
    this.openAccessTokenDialog(
      this.data.serviceAccountView.name,
      accessToken,
      accessTokenView.expireAt
    );
    this.dialogRef.close();
  };

  private getExpiresDate(): Date {
    if (this.formGroup.value.expires == "custom") {
      return new Date(this.formGroup.value.expireDateTime);
    }
    const currentDate = new Date();
    currentDate.setDate(currentDate.getDate() + Number(this.formGroup.value.expires));
    return currentDate;
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
}
