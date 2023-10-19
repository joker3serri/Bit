import { DialogRef } from "@angular/cdk/dialog";
import { Injectable, NgZone } from "@angular/core";
import { Subject, firstValueFrom } from "rxjs";

import { BroadcasterService } from "@bitwarden/common/platform/abstractions/broadcaster.service";
import { DialogService } from "@bitwarden/components";

import { DuoStatus } from "../../importers/lastpass/access/enums";
import { OtpResult, OobResult } from "../../importers/lastpass/access/models";
import { DuoChoice, DuoDevice, Ui } from "../../importers/lastpass/access/ui";

import { LastPassMultifactorPromptComponent } from "./dialog";

@Injectable({
  providedIn: "root",
})
export class LastPassDirectImportService implements Ui {
  private _ssoCallback$ = new Subject<{ oidcCode: string; oidcState: string }>();
  ssoCallback$ = this._ssoCallback$.asObservable();

  private mfaDialogRef: DialogRef<string>;

  constructor(
    private dialogService: DialogService,
    private broadcasterService: BroadcasterService,
    private ngZone: NgZone
  ) {
    /** TODO: remove this in favor of dedicated service */
    this.broadcasterService.subscribe("LastPassDirectImportService", (message: any) => {
      this.ngZone.run(async () => {
        switch (message.command) {
          case "ssoCallbackLastPass":
            this._ssoCallback$.next({ oidcCode: message.code, oidcState: message.state });
            break;
          default:
            break;
        }
      });
    });
  }

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
