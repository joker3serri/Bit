import { DialogRef } from "@angular/cdk/dialog";
import { Directive, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";

import { PinServiceAbstraction } from "@bitwarden/auth/common";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { StateService } from "@bitwarden/common/platform/abstractions/state.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

@Directive()
export class SetPinComponent implements OnInit {
  showMasterPasswordOnClientRestart = true;

  setPinForm = this.formBuilder.group({
    pin: ["", [Validators.required]],
    requireMasterPasswordOnClientRestart: true,
  });

  constructor(
    private accountService: AccountService,
    private cryptoService: CryptoService,
    private dialogRef: DialogRef,
    private formBuilder: FormBuilder,
    private pinService: PinServiceAbstraction,
    private stateService: StateService,
    private userVerificationService: UserVerificationService,
  ) {}

  async ngOnInit() {
    const hasMasterPassword = await this.userVerificationService.hasMasterPassword();

    this.setPinForm.controls.requireMasterPasswordOnClientRestart.setValue(hasMasterPassword);
    this.showMasterPasswordOnClientRestart = hasMasterPassword;
  }

  submit = async () => {
    const pin = this.setPinForm.get("pin").value;
    const requireMasterPasswordOnClientRestart = this.setPinForm.get(
      "requireMasterPasswordOnClientRestart",
    ).value;

    if (Utils.isNullOrWhitespace(pin)) {
      this.dialogRef.close(false);
      return;
    }

    const pinKey = await this.pinService.makePinKey(
      pin,
      await this.stateService.getEmail(),
      await this.stateService.getKdfType(),
      await this.stateService.getKdfConfig(),
    );
    const userKey = await this.cryptoService.getUserKey();
    const pinKeyEncryptedUserKey = await this.cryptoService.encrypt(userKey.key, pinKey);
    const userKeyEncryptedPin = await this.cryptoService.encrypt(pin, userKey);

    const userId = (await firstValueFrom(this.accountService.activeAccount$))?.id;

    await this.pinService.setProtectedPin(userKeyEncryptedPin.encryptedString, userId);

    if (requireMasterPasswordOnClientRestart) {
      await this.pinService.setPinKeyEncryptedUserKeyEphemeral(pinKeyEncryptedUserKey, userId);
    } else {
      await this.pinService.setPinKeyEncryptedUserKey(pinKeyEncryptedUserKey, userId);
    }

    this.dialogRef.close(true);
  };
}
