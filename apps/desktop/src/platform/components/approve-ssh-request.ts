import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  AsyncActionsModule,
  ButtonModule,
  DialogModule,
  FormFieldModule,
  IconButtonModule,
} from "@bitwarden/components";
import { DialogService } from "@bitwarden/components/src/dialog";
import { CipherFormGeneratorComponent } from "@bitwarden/vault";

export interface ApproveSshRequestParams {
  cipherName: string;
  applicationName: string;
  isAgentForwarding: boolean;
  action: string;
}

@Component({
  selector: "app-approve-ssh-request",
  templateUrl: "approve-ssh-request.html",
  standalone: true,
  imports: [
    DialogModule,
    CommonModule,
    JslibModule,
    CipherFormGeneratorComponent,
    ButtonModule,
    IconButtonModule,
    ReactiveFormsModule,
    AsyncActionsModule,
    FormFieldModule,
  ],
})
export class ApproveSshRequestComponent {
  approveSshRequestForm = this.formBuilder.group({});

  constructor(
    @Inject(DIALOG_DATA) protected params: ApproveSshRequestParams,
    private dialogRef: DialogRef<boolean>,
    private formBuilder: FormBuilder,
  ) {}

  static open(
    dialogService: DialogService,
    cipherName: string,
    applicationName: string,
    isAgentForwarding: boolean,
    isSignRequest: boolean,
    isGitSignRequest: boolean,
  ) {
    let actioni18nKey = "sshActionLogin";
    if (isGitSignRequest) {
      actioni18nKey = "sshActionGitSign";
    } else if (isSignRequest) {
      actioni18nKey = "sshActionSign";
    }

    return dialogService.open<boolean, ApproveSshRequestParams>(ApproveSshRequestComponent, {
      data: {
        cipherName,
        applicationName,
        isAgentForwarding,
        action: actioni18nKey,
      },
    });
  }

  submit = async () => {
    this.dialogRef.close(true);
  };
}
