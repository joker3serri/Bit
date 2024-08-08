import { Component, Inject, OnDestroy, OnInit, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { CipherType } from "@bitwarden/common/vault/enums/cipher-type";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { DIALOG_DATA, DialogConfig, DialogRef } from "@angular/cdk/dialog";
import { AsyncActionsModule, DialogModule, DialogService } from "@bitwarden/components";
import { MessagingService } from "@bitwarden/common/platform/abstractions/messaging.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { CipherViewComponent } from "../../../../../../libs/vault/src/cipher-view/cipher-view.component";
import { SharedModule } from "../../shared/shared.module";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { ToastService } from "@bitwarden/components";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";

export interface ViewCipherDialogParams {
  cipher: CipherView;
  cipherTypeString: string;
  cipherEditUrl: string;
}

@Component({
  selector: "app-vault-view",
  templateUrl: "view.component.html",
  standalone: true,
  imports: [CipherViewComponent, CommonModule, AsyncActionsModule, DialogModule, SharedModule],
})
export class ViewComponent implements OnInit {
  cipher: CipherView;
  deletePromise: Promise<any>;
  onDeletedCipher = new EventEmitter<CipherView>();
  cipherTypeString: string;
  cipherEditUrl: string;
  organization: Organization; // Add this property
  flexibleCollectionsV1Enabled = false; // Add this property
  restrictProviderAccess = false; // Add this property

  constructor(
    @Inject(DIALOG_DATA) public params: ViewCipherDialogParams,
    private dialogRef: DialogRef<any>,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private router: Router,
    private dialogService: DialogService,
    private messagingService: MessagingService,
    private logService: LogService,
    private cipherService: CipherService,
    private toastService: ToastService,
    private organizationService: OrganizationService, // Add this injection
  ) {}

  async ngOnInit() {
    this.cipher = this.params.cipher;
    this.cipherTypeString = this.params.cipherTypeString;
    this.cipherEditUrl = this.params.cipherEditUrl;
    if (this.cipher.organizationId) {
      this.organization = await this.organizationService.get(this.cipher.organizationId);
    }
  }

  async delete(): Promise<boolean> {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "deleteItem" },
      content: {
        key: this.cipher.isDeleted ? "permanentlyDeleteItemConfirmation" : "deleteItemConfirmation",
      },
      type: "warning",
    });

    if (!confirmed) {
      return false;
    }

    try {
      this.deletePromise = this.deleteCipher();
      await this.deletePromise;
      this.toastService.showToast({
        variant: "success",
        title: this.i18nService.t("success"),
        message: this.i18nService.t(
          this.cipher.isDeleted ? "permanentlyDeletedItem" : "deletedItem",
        ),
      });
      this.onDeletedCipher.emit(this.cipher);
      this.messagingService.send(
        this.cipher.isDeleted ? "permanentlyDeletedCipher" : "deletedCipher",
      );
    } catch (e) {
      this.logService.error(e);
    }

    this.dialogRef.close();

    return true;
  }

  protected async deleteCipher(): Promise<void> {
    const asAdmin = this.organization?.canEditAllCiphers(
      this.flexibleCollectionsV1Enabled,
      this.restrictProviderAccess,
    );
    if (this.cipher.isDeleted) {
      await this.cipherService.deleteWithServer(this.cipher.id, asAdmin);
    } else {
      await this.cipherService.softDeleteWithServer(this.cipher.id, asAdmin);
    }
  }

  static getCipherViewTypeString(cipher: CipherView, i18nService: I18nService): string {
    if (!cipher) {
      return null;
    }

    const type = cipher.type;
    switch (type) {
      case CipherType.Login:
        return i18nService.t("viewItemType", "login");
      case CipherType.SecureNote:
        return i18nService.t("viewItemType", "note");
      case CipherType.Card:
        return i18nService.t("viewItemType", "card");
      case CipherType.Identity:
        return i18nService.t("viewItemType", "identity");
      default:
        return null;
    }
  }
}

/**
 * Strongly typed helper to open a cipher view dialog
 * @param dialogService Instance of the dialog service that will be used to open the dialog
 * @param data Data to be passed to the dialog
 */
export function openViewCipherDialog(
  dialogService: DialogService,
  config: DialogConfig<ViewCipherDialogParams>,
) {
  return dialogService.open(ViewComponent, config);
}
