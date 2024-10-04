import { Component, OnInit, ViewChild, ViewContainerRef } from "@angular/core";
import { lastValueFrom, map, Observable, of, switchMap } from "rxjs";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { UserVerificationService } from "@bitwarden/common/auth/abstractions/user-verification/user-verification.service.abstraction";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { DialogService } from "@bitwarden/components";

import { PurgeVaultComponent } from "../../../vault/settings/purge-vault.component";

import { DeauthorizeSessionsComponent } from "./deauthorize-sessions.component";
import { DeleteAccountDialogComponent } from "./delete-account-dialog.component";

@Component({
  selector: "app-account",
  templateUrl: "account.component.html",
})
export class AccountComponent implements OnInit {
  @ViewChild("deauthorizeSessionsTemplate", { read: ViewContainerRef, static: true })
  deauthModalRef: ViewContainerRef;

  showChangeEmail = true;
  showPurgeVault$: Observable<boolean>;

  constructor(
    private modalService: ModalService,
    private dialogService: DialogService,
    private userVerificationService: UserVerificationService,
    private accountService: AccountService,
    private configService: ConfigService,
  ) {}

  async ngOnInit() {
    this.showChangeEmail = await this.userVerificationService.hasMasterPassword();
    this.showPurgeVault$ = this.configService
      .getFeatureFlag$(FeatureFlag.AccountDeprovisioning)
      .pipe(
        switchMap((isAccountDeprovisioningEnabled) =>
          isAccountDeprovisioningEnabled
            ? this.accountService.activeAccount$.pipe(
                map((account) => account?.managedByOrganizationId === null),
              )
            : of(true),
        ),
      );
  }

  async deauthorizeSessions() {
    await this.modalService.openViewRef(DeauthorizeSessionsComponent, this.deauthModalRef);
  }

  purgeVault = async () => {
    const dialogRef = PurgeVaultComponent.open(this.dialogService);
    await lastValueFrom(dialogRef.closed);
  };

  deleteAccount = async () => {
    const dialogRef = DeleteAccountDialogComponent.open(this.dialogService);
    await lastValueFrom(dialogRef.closed);
  };
}
