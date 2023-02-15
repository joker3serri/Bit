import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

import { TrashService } from "../../trash/services/trash.service";
import { SecretService } from "../secret.service";

export interface SecretDeleteOperation {
  secretIds: string[];
  hardDelete: boolean;
  organizationId: string;
}

@Component({
  selector: "sm-secret-delete-dialog",
  templateUrl: "./secret-delete.component.html",
})
export class SecretDeleteDialogComponent {
  constructor(
    public dialogRef: DialogRef,
    private secretService: SecretService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private trashService: TrashService,
    @Inject(DIALOG_DATA) public data: SecretDeleteOperation
  ) {}

  get title() {
    if (this.data.hardDelete) {
      return this.data.secretIds.length === 1 ? "hardDeleteSecret" : "hardDeleteSecrets";
    } else {
      return this.data.secretIds.length === 1 ? "deleteSecret" : "deleteSecrets";
    }
  }

  get submitButtonText() {
    return this.data.secretIds.length === 1 ? "deleteSecret" : "deleteSecrets";
  }

  delete = async () => {
    let message = "";
    if (this.data.hardDelete) {
      await this.trashService.delete(this.data.organizationId, this.data.secretIds);
      message =
        this.data.secretIds.length === 1 ? "hardDeleteSuccessToast" : "hardDeletesSuccessToast";
    } else {
      await this.secretService.delete(this.data.secretIds);
      message =
        this.data.secretIds.length === 1 ? "softDeleteSuccessToast" : "softDeletesSuccessToast";
    }
    this.dialogRef.close(this.data.secretIds);
    this.platformUtilsService.showToast("success", null, this.i18nService.t(message));
  };
}
