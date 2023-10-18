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
  constructor(private dialogSerive: DialogService) {}

  private async getResult() {
    const passcode = await LastPassMultifactorPromptComponent.open(this.dialogSerive);
    return new OtpResult(passcode, false);
  }

  async provideGoogleAuthPasscode() {
    return this.getResult();
  }

  async provideMicrosoftAuthPasscode() {
    return this.getResult();
  }

  async provideYubikeyPasscode() {
    return this.getResult();
  }

  approveLastPassAuth: () => Promise<OobResult>;
  approveDuo: () => Promise<OobResult>;
  approveSalesforceAuth: () => Promise<OobResult>;
  chooseDuoFactor: (devices: [DuoDevice]) => DuoChoice;
  provideDuoPasscode: (device: DuoDevice) => string;
  updateDuoStatus: (status: DuoStatus, text: string) => void;
}
