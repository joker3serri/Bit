import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

import { SecretService } from "../../secrets/secret.service";

export interface SecretDeletePermanentlyOperation {
  secretIds: string[];
  organizationId: string;
}

@Component({
  selector: "sm-secret-delete-permanently-dialog",
  templateUrl: "./secret-delete-permanently.component.html",
})
export class SecretDeletePermanentlyDialogComponent {
  constructor(
    public dialogRef: DialogRef,
    private secretService: SecretService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    @Inject(DIALOG_DATA) public data: SecretDeletePermanentlyOperation
  ) {}

  get title() {
    return this.data.secretIds.length === 1 ? "hardDeleteSecret" : "hardDeleteSecrets";
  }

  get submitButtonText() {
    return this.data.secretIds.length === 1 ? "deleteSecret" : "deleteSecrets";
  }

  delete = async () => {
    await this.secretService.deleteTrashed(this.data.organizationId, this.data.secretIds);
    const message =
      this.data.secretIds.length === 1 ? "hardDeleteSuccessToast" : "hardDeletesSuccessToast";
    this.dialogRef.close(this.data.secretIds);
    this.platformUtilsService.showToast("success", null, this.i18nService.t(message));
  };
}
