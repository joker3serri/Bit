import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

import { TrashService } from "../../trash/services/trash.service";
import { SecretService } from "../secret.service";

export interface SecretRestoreOperation {
  secretIds: string[];
  organizationId: string;
}

@Component({
  selector: "sm-secret-restore-dialog",
  templateUrl: "./secret-restore.component.html",
})
export class SecretRestoreDialogComponent {
  constructor(
    public dialogRef: DialogRef,
    private secretService: SecretService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private trashService: TrashService,
    @Inject(DIALOG_DATA) public data: SecretRestoreOperation
  ) {}

  get title() {
    return this.data.secretIds.length === 1 ? "restoreSecret" : "restoreSecrets";
  }

  restore = async () => {
    let message = "";
    await this.trashService.restore(this.data.organizationId, this.data.secretIds);
    message =
      this.data.secretIds.length === 1
        ? "secretRestoredSuccessToast"
        : "secretsRestoredSuccessToast";
    this.dialogRef.close(this.data.secretIds);
    this.platformUtilsService.showToast("success", null, this.i18nService.t(message));
  };
}
