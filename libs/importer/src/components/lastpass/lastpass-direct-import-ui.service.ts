import { DialogRef } from "@angular/cdk/dialog";
import { Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";

import { DialogService } from "@bitwarden/components";

import { DuoStatus } from "../../importers/lastpass/access/enums";
import { OtpResult, OobResult } from "../../importers/lastpass/access/models";
import { DuoChoice, DuoDevice, Ui } from "../../importers/lastpass/access/ui";

import { LastPassMultifactorPromptComponent } from "./dialog";

@Injectable({
  providedIn: "root",
})
export class LastPassDirectImportUIService implements Ui {
  private mfaDialogRef: DialogRef<string>;

  constructor(private dialogService: DialogService) {}

  private async getOTPResult() {
    this.mfaDialogRef = LastPassMultifactorPromptComponent.open(this.dialogService);
    const passcode = await firstValueFrom(this.mfaDialogRef.closed);
    return new OtpResult(passcode, false);
  }

  private async getOOBResult() {
    this.mfaDialogRef = LastPassMultifactorPromptComponent.open(this.dialogService, {
      isOOB: true,
    });
    const passcode = await firstValueFrom(this.mfaDialogRef.closed);
    return new OobResult(false, passcode, false);
  }

  closeMFADialog() {
    this.mfaDialogRef?.close();
  }

  async provideGoogleAuthPasscode() {
    return this.getOTPResult();
  }

  async provideMicrosoftAuthPasscode() {
    return this.getOTPResult();
  }

  async provideYubikeyPasscode() {
    return this.getOTPResult();
  }

  async approveLastPassAuth() {
    return this.getOOBResult();
  }
  async approveDuo() {
    return this.getOOBResult();
  }
  async approveSalesforceAuth() {
    return this.getOOBResult();
  }

  /** These aren't used anywhere. Are they needed? */
  chooseDuoFactor: (devices: [DuoDevice]) => DuoChoice = () => {
    throw new Error("Not implemented");
  };
  provideDuoPasscode: (device: DuoDevice) => string = () => {
    throw new Error("Not implemented");
  };
  updateDuoStatus: (status: DuoStatus, text: string) => void = () => {
    throw new Error("Not implemented");
  };
}
