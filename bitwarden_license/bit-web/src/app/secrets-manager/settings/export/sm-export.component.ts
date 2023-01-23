import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subject, switchMap, takeUntil } from "rxjs";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { VerificationType } from "@bitwarden/common/enums/verificationType";
import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";

import { SMExportService } from "./sm-export.service";

@Component({
  selector: "sm-export",
  templateUrl: "./sm-export.component.html",
})
export class SMExportComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();

  protected orgName: string;
  protected orgId: string;
  protected exportFormats: string[] = ["json"];

  protected formGroup = new FormGroup({
    format: new FormControl("json", [Validators.required]),
    masterPassword: new FormControl("", [Validators.required]),
  });

  constructor(
    private route: ActivatedRoute,
    private i18nService: I18nService,
    private organizationService: OrganizationService,
    private userVerificationService: UserVerificationService,
    private platformUtilsService: PlatformUtilsService,
    private SMExportService: SMExportService,
    protected fileDownloadService: FileDownloadService,
    private logService: LogService
  ) {}

  async ngOnInit() {
    this.route.params
      .pipe(
        switchMap(async (params) => await this.organizationService.get(params.organizationId)),
        takeUntil(this.destroy$)
      )
      .subscribe((organization) => {
        this.orgName = organization.name;
        this.orgId = organization.id;
      });

    this.formGroup.get("format").disable();
  }

  async ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }

  submit = async () => {
    this.formGroup.markAllAsTouched();

    if (this.formGroup.invalid) {
      return;
    }

    try {
      // Incorrect secret will throw an invalid password error.
      await this.userVerificationService.verifyUser({
        type: VerificationType.MasterPassword,
        secret: this.formGroup.get("masterPassword").value,
      });
    } catch (e) {
      this.platformUtilsService.showToast(
        "error",
        this.i18nService.t("error"),
        this.i18nService.t("invalidMasterPassword")
      );
      return;
    }

    this.doExport();
  };

  protected async doExport() {
    try {
      let exportData = await this.SMExportService.getExport(
        this.orgId,
        this.formGroup.get("format").value
      );

      this.downloadFile(exportData, this.formGroup.get("format").value);

      this.formGroup.get("masterPassword").setValue("");
      this.formGroup.get("masterPassword").setErrors(null);
    } catch (e) {
      this.logService.error(e);
    }
  }

  private downloadFile(data: string, format: string): void {
    const fileName = this.getFileName(null, format);
    this.fileDownloadService.download({
      fileName: fileName,
      blobData: data,
      blobOptions: { type: "text/plain" },
    });
  }

  private getFileName(prefix: string = null, extension = "json"): string {
    const now = new Date();
    const dateString =
      now.getFullYear() +
      "" +
      this.padNumber(now.getMonth() + 1, 2) +
      "" +
      this.padNumber(now.getDate(), 2) +
      this.padNumber(now.getHours(), 2) +
      "" +
      this.padNumber(now.getMinutes(), 2) +
      this.padNumber(now.getSeconds(), 2);

    return "bitwarden" + (prefix ? "_" + prefix : "") + "_export_" + dateString + "." + extension;
  }

  private padNumber(num: number, width: number, padCharacter = "0"): string {
    const numString = num.toString();
    return numString.length >= width
      ? numString
      : new Array(width - numString.length + 1).join(padCharacter) + numString;
  }
}
