import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { Component, Inject, OnInit } from "@angular/core";
import { FormGroup, ReactiveFormsModule } from "@angular/forms";
import { RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  AsyncActionsModule,
  ButtonModule,
  DialogModule,
  DialogService,
  FormFieldModule,
} from "@bitwarden/components";

export type LoginApprovalDialogData = {
  name: string;
  userId: string;
  fingerprint: string;
};

@Component({
  selector: "login-approval",
  templateUrl: "login-approval.component.html",
  standalone: true,
  imports: [
    CommonModule,
    JslibModule,
    ReactiveFormsModule,
    FormFieldModule,
    AsyncActionsModule,
    RouterLink,
    ButtonModule,
    DialogModule,
  ],
})
export class LoginApprovalComponent implements OnInit {
  name: string;
  userId: string;
  fingerprint: string;

  loading = true;
  formPromise: Promise<any>;

  formGroup = new FormGroup({});

  constructor(
    @Inject(DIALOG_DATA) protected data: LoginApprovalDialogData,
    private dialogRef: DialogRef,
  ) {
    this.name = data.name;
    this.userId = data.userId;
  }

  async ngOnInit() {
    this.loading = false;
  }

  submit = async () => {
    if (this.loading) {
      return;
    }

    this.dialogRef.close();
  };

  static open(dialogService: DialogService, config: DialogConfig<LoginApprovalDialogData>) {
    return dialogService.open(LoginApprovalComponent, config);
  }
}
