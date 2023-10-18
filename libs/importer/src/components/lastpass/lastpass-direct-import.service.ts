import { Injectable } from "@angular/core";

import { DialogService } from "@bitwarden/components";

import { DuoStatus } from "../../importers/lastpass/access/enums";
import { OtpResult, OobResult } from "../../importers/lastpass/access/models";
import { DuoChoice, DuoDevice, Ui } from "../../importers/lastpass/access/ui";

import { LastPassMultifactorPromptComponent } from "./dialog";

@Injectable({
  providedIn: "root",
})
export class LastPassDirectImportService implements Ui {
  constructor(private dialogService: DialogService) {}

  private async getOTPResult() {
    const passcode = await LastPassMultifactorPromptComponent.open(this.dialogService);
    return new OtpResult(passcode, false);
  }

  private async getOOBResult() {
    const passcode = await LastPassMultifactorPromptComponent.open(this.dialogService);
    return new OobResult(false, passcode, false);
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
  chooseDuoFactor: (devices: [DuoDevice]) => DuoChoice;
  provideDuoPasscode: (device: DuoDevice) => string;
  updateDuoStatus: (status: DuoStatus, text: string) => void;
}
