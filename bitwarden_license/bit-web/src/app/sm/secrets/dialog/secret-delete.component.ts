import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";

import { ValidationService } from "@bitwarden/angular/services/validation.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";

import { SecretService } from "../secret.service";

export enum DeleteOperationType {
  Single,
  Bulk,
}

export interface SecretDeleteOperation {
  operation: DeleteOperationType;
  secretIds: string[];
}

@Component({
  selector: "sm-secret-delete-dialog",
  templateUrl: "./secret-delete.component.html",
})
export class SecretDeleteDialogComponent {
  DeleteOperationType = DeleteOperationType;

  constructor(
    public dialogRef: DialogRef,
    private secretService: SecretService,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private logService: LogService,
    private validationService: ValidationService,
    @Inject(DIALOG_DATA) public data: SecretDeleteOperation
  ) {}

  get title() {
    return this.data.operation === DeleteOperationType.Single ? "deleteSecret" : "deleteSecrets";
  }

  async delete() {
    try {
      await this.secretService.delete(this.data.secretIds);
      this.dialogRef.close();
      if (this.data.operation === DeleteOperationType.Single) {
        this.platformUtilsService.showToast(
          "success",
          null,
          this.i18nService.t("softDeleteSuccessToast")
        );
      } else {
        this.platformUtilsService.showToast(
          "success",
          null,
          this.i18nService.t("softDeletesSuccessToast")
        );
      }
    } catch (e) {
      this.logService.error(e);
      this.validationService.showError(e);
      this.dialogRef.close();
    }
  }
}
