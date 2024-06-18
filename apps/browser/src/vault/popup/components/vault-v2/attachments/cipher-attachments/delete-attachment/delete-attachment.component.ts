import { CommonModule } from "@angular/common";
import { Component, EventEmitter, Input, Output } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { AttachmentView } from "@bitwarden/common/vault/models/view/attachment.view";
import { ButtonModule, DialogService, IconButtonModule, ToastService } from "@bitwarden/components";

@Component({
  standalone: true,
  selector: "app-delete-attachment",
  templateUrl: "./delete-attachment.component.html",
  imports: [CommonModule, JslibModule, ButtonModule, IconButtonModule],
})
export class DeleteAttachmentComponent {
  /** Id of the cipher associated with the attachment */
  @Input({ required: true }) cipherId: string;

  /** The attachment that is can be deleted */
  @Input({ required: true }) attachment: AttachmentView;

  /** Emits when the attachment is successfully deleted */
  @Output() onDeletionSuccess = new EventEmitter<void>();

  /** True when the deletion of the attachment is inflight */
  deleting = false;

  constructor(
    private toastService: ToastService,
    private i18nService: I18nService,
    private cipherService: CipherService,
    private logService: LogService,
    private dialogService: DialogService,
  ) {}

  delete = async () => {
    if (this.deleting) {
      return;
    }

    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "deleteAttachment" },
      content: { key: "permanentlyDeleteAttachmentConfirmation" },
      type: "warning",
    });

    if (!confirmed) {
      this.deleting = false;
      return;
    }

    try {
      this.deleting = true;

      await this.cipherService.deleteAttachmentWithServer(this.cipherId, this.attachment.id);

      this.toastService.showToast({
        variant: "success",
        title: null,
        message: this.i18nService.t("deletedAttachment"),
      });

      this.onDeletionSuccess.emit();
    } catch (e) {
      this.logService.error(e);
    }

    this.deleting = false;
  };
}
