import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { DialogServiceAbstraction } from "@bitwarden/angular/services/dialog";
import { FolderAddEditComponent as BaseFolderAddEditComponent } from "@bitwarden/angular/vault/components/folder-add-edit.component";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { FolderApiServiceAbstraction } from "@bitwarden/common/vault/abstractions/folder/folder-api.service.abstraction";
import { FolderService } from "@bitwarden/common/vault/abstractions/folder/folder.service.abstraction";

@Component({
  selector: "app-folder-add-edit",
  templateUrl: "folder-add-edit.component.html",
})
export class FolderAddEditComponent extends BaseFolderAddEditComponent {
  protected override componentName = "app-folder-add-edit";
  constructor(
    folderService: FolderService,
    folderApiService: FolderApiServiceAbstraction,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    logService: LogService,
    dialogService: DialogServiceAbstraction,
    formBuilder: FormBuilder,
    protected dialogRef: DialogRef<any>,
    @Inject(DIALOG_DATA) params: { folderId: string }
  ) {
    super(
      folderService,
      folderApiService,
      i18nService,
      platformUtilsService,
      logService,
      dialogService,
      formBuilder
    );
    params?.folderId ? (this.folderId = params.folderId) : null;
  }

  async deleteAndClose() {
    const deleteResult = await super.delete();
    if (deleteResult) {
      this.dialogRef.close(deleteResult);
    }
  }

  async submitAndClose() {
    const submitResult = await super.submit();
    if (submitResult) {
      this.dialogRef.close(submitResult);
    }
  }
}
