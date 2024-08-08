import { Component, Inject, OnDestroy, OnInit, EventEmitter } from "@angular/core";
import { Router } from "@angular/router";
import { CommonModule } from "@angular/common"; // Add this import
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

export interface ViewCipherDialogParams {
  cipher: CipherView;
  cipherTypeString: string;
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
  ) {}

  ngOnInit() {
    this.cipher = this.params.cipher;
    this.cipherTypeString = this.params.cipherTypeString;
  }

  async getCipherData(id: string) {
    const cipher = await this.cipherService.get(id);
    return await cipher.decrypt(await this.cipherService.getKeyForCipherKeyDecryption(cipher));
  }

  async copy(value: string, typeI18nKey: string, aType: string): Promise<boolean> {
    if (value == null) {
      return false;
    }

    this.platformUtilsService.copyToClipboard(value, { window: window });
    this.platformUtilsService.showToast(
      "info",
      null,
      this.i18nService.t("valueCopied", this.i18nService.t(typeI18nKey)),
    );

    return true;
  }

  async submit() {
    await this.router.navigate([], {
      queryParams: { itemId: this.cipher.id, action: "edit" },
      queryParamsHandling: "merge",
    });

    return true;
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
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t(this.cipher.isDeleted ? "permanentlyDeletedItem" : "deletedItem"),
      );
      this.onDeletedCipher.emit(this.cipher);
      this.messagingService.send(
        this.cipher.isDeleted ? "permanentlyDeletedCipher" : "deletedCipher",
      );
    } catch (e) {
      this.logService.error(e);
    }

    return true;
  }

  private async deleteCipher() {
    // Implement the logic to delete the cipher here
    // This is a placeholder implementation
    return new Promise((resolve) => setTimeout(resolve, 1000));
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
