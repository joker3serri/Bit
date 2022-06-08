import { Component } from "@angular/core";

import { FolderAddEditComponent as BaseFolderAddEditComponent } from "@bitwarden/angular/src/components/folder-add-edit.component";
import { FolderService } from "@bitwarden/common/src/abstractions/folder.service";
import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/src/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/src/abstractions/platformUtils.service";

@Component({
  selector: "app-folder-add-edit",
  templateUrl: "folder-add-edit.component.html",
})
export class FolderAddEditComponent extends BaseFolderAddEditComponent {
  constructor(
    folderService: FolderService,
    i18nService: I18nService,
    platformUtilsService: PlatformUtilsService,
    logService: LogService
  ) {
    super(folderService, i18nService, platformUtilsService, logService);
  }
}
