import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subject, switchMap, takeUntil } from "rxjs";

import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { ImportType } from "@bitwarden/common/enums/importOptions";
import { DialogService } from "@bitwarden/components";

import {
  SMImportErrorDialogComponent,
  SMImportErrorDialogOperation,
} from "../dialog/sm-import-error-dialog.component";
import { SecretsManagerImportError } from "../models/error/sm-import-error";

import { SMPortingService } from "./sm-porting.service";

@Component({
  selector: "sm-import",
  templateUrl: "./sm-import.component.html",
})
export class SMImportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  protected formGroup = new FormGroup({
    fileSelected: new FormControl(null, [Validators.required]),
    fileContents: new FormControl("", [Validators.required]),
  });

  format: ImportType = "bitwardenjson";
  protected orgId: string = null;

  constructor(
    private route: ActivatedRoute,
    private i18nService: I18nService,
    private organizationService: OrganizationService,
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

  submit = async () => {
    const fileEl = document.getElementById("file") as HTMLInputElement;
    const files = fileEl.files;

    if (
      (files == null || files.length === 0) &&
      (this.formGroup.get("fileContents").value == null ||
        this.formGroup.get("fileContents").value.trim() === "")
    ) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("errorOccurred"),
        this.i18nService.t("selectFile")
      );
      return;
    }

    let fileContents = this.formGroup.get("fileContents").value;
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
      return;
    }

    try {
      const error = await this.smPortingService.import(this.orgId, fileContents);

      if (error != null) {
        this.openImportErrorDialog(error);
        return;
      }

      this.platformUtilsService.showToast("success", null, this.i18nService.t("importSuccess"));
      this.clearForm();
    } catch (e) {
      this.logService.error(e);
    }
  };

  private clearForm() {
    (document.getElementById("file") as HTMLInputElement).value = "";
    this.formGroup.get("fileSelected").setValue(null);
    this.formGroup.get("fileContents").setValue("");
  }

  protected setSelectedFile(event: Event) {
    const fileInputEl = <HTMLInputElement>event.target;
    const file = fileInputEl.files.length > 0 ? fileInputEl.files[0] : null;
    this.formGroup.get("fileSelected")?.setValue(file);
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

  private openImportErrorDialog(error: SecretsManagerImportError) {
    this.dialogService.open<unknown, SMImportErrorDialogOperation>(SMImportErrorDialogComponent, {
      data: {
        error: error,
      },
    });
  }
}
