import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { firstValueFrom, Subject, switchMap, takeUntil } from "rxjs";

import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { ImportType } from "@bitwarden/common/enums/importOptions";
import { DialogService } from "@bitwarden/components";

import {
  SMImportErrorDialogComponent,
  SMImportErrorDialogOperation,
  SMImportErrorDialogResult,
} from "../dialog/sm-import-error-dialog.component";

import { SMPortingService } from "./sm-porting.service";

@Component({
  selector: "sm-import",
  templateUrl: "./sm-import.component.html",
})
export class SMImportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  format: ImportType = "bitwardenjson";
  fileSelected: File;
  fileContents: string;
  loading = false;
  protected orgId: string = null;

  constructor(
    private route: ActivatedRoute,
    private i18nService: I18nService,
    private organizationService: OrganizationService,
    private userVerificationService: UserVerificationService,
    private platformUtilsService: PlatformUtilsService,
    protected fileDownloadService: FileDownloadService,
    private logService: LogService,
    private smPortingService: SMPortingService,
    private dialogService: DialogService
  ) {}

  async ngOnInit() {
    this.route.params
      .pipe(
        switchMap(async (params) => await this.organizationService.get(params.organizationId)),
        takeUntil(this.destroy$)
      )
      .subscribe((organization) => {
        this.orgId = organization.id;
      });
  }

  async ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  async submit() {
    this.loading = true;

    const fileEl = document.getElementById("file") as HTMLInputElement;
    const files = fileEl.files;
    if (
      (files == null || files.length === 0) &&
      (this.fileContents == null || this.fileContents === "")
    ) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("selectFile")
      );
      this.loading = false;
      return;
    }

    let fileContents = this.fileContents;
    if (files != null && files.length > 0) {
      try {
        const content = await this.getFileContents(files[0]);
        if (content != null) {
          fileContents = content;
        }
      } catch (e) {
        this.logService.error(e);
      }
    }

    if (fileContents == null || fileContents === "") {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("selectFile")
      );
      this.loading = false;
      return;
    }

    try {
      const error = await this.smPortingService.import(this.orgId, fileContents);

      if (error != null) {
        this.error(error);
        this.loading = false;
        return;
      }

      this.platformUtilsService.showToast("success", null, this.i18nService.t("importSuccess"));
    } catch (e) {
      this.logService.error(e);
    }

    this.loading = false;
  }

  protected setSelectedFile(event: Event) {
    const fileInputEl = <HTMLInputElement>event.target;
    this.fileSelected = fileInputEl.files.length > 0 ? fileInputEl.files[0] : null;
  }

  private getFileContents(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsText(file, "utf-8");
      reader.onload = (evt) => {
        resolve((evt.target as any).result);
      };
      reader.onerror = () => {
        reject();
      };
    });
  }

  private async error(error: Error) {
    this.openImportErrorDialog(error);
  }

  private async openImportErrorDialog(error: Error) {
    const dialogResult = this.dialogService.open<
      SMImportErrorDialogResult,
      SMImportErrorDialogOperation
    >(SMImportErrorDialogComponent, {
      data: {
        error: error,
      },
    });

    const result = await firstValueFrom(dialogResult.closed);

    if (result == SMImportErrorDialogResult.ErrorDuringDialog) {
      this.platformUtilsService.showToast("error", null, this.i18nService.t("errorOccurred"));
    }
  }
}
