import { DialogRef } from "@angular/cdk/dialog";
import { Directive, OnInit } from "@angular/core";
import { FormBuilder, Validators } from "@angular/forms";
import { firstValueFrom } from "rxjs";

import { PinServiceAbstraction } from "@bitwarden/auth/common";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
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

    const userId = (await firstValueFrom(this.accountService.activeAccount$))?.id;
    const userKey = await this.cryptoService.getUserKey();

    const protectedPin = await this.pinService.createProtectedPin(pin, userKey);
    await this.pinService.setProtectedPin(protectedPin.encryptedString, userId);

    const pinKeyEncryptedUserKey = await this.pinService.createPinKeyEncryptedUserKey(
      pin,
      userKey,
      userId,
    );
    await this.pinService.storePinKeyEncryptedUserKey(
      pinKeyEncryptedUserKey,
      requireMasterPasswordOnClientRestart,
      userId,
    );

    this.dialogRef.close(true);
  };
}
