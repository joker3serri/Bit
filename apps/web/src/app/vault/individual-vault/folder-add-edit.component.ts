import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { DialogServiceAbstraction, SimpleDialogType } from "@bitwarden/angular/services/dialog";
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

  deleteAndClose = async () => {
    const confirmed = await this.dialogService.openSimpleDialog({
      title: { key: "deleteFolder" },
      content: { key: "deleteFolderConfirmation" },
      type: SimpleDialogType.WARNING,
    });

    if (!confirmed) {
      return;
    }

    try {
      this.deletePromise = this.folderApiService.delete(this.folder.id);
      await this.deletePromise;
      this.platformUtilsService.showToast("success", null, this.i18nService.t("deletedFolder"));
      this.onDeletedFolder.emit(this.folder);
    } catch (e) {
      this.logService.error(e);
    }

    this.dialogRef.close(true);
  };

  submitAndClose = async () => {
    this.folder.name = this.formGroup.controls.name.value;
    if (this.folder.name == null || this.folder.name === "") {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("nameRequired")
      );
      return;
    }

    try {
      const folder = await this.folderService.encrypt(this.folder);
      this.formPromise = this.folderApiService.save(folder);
      await this.formPromise;
      this.platformUtilsService.showToast(
        "success",
        null,
        this.i18nService.t(this.editMode ? "editedFolder" : "addedFolder")
      );
      this.onSavedFolder.emit(this.folder);
      this.dialogRef.close(true);
    } catch (e) {
      this.logService.error(e);
    }
    return;
  };
}
