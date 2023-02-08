import { Component, OnDestroy, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { Subject, switchMap, takeUntil } from "rxjs";

import { ModalService } from "@bitwarden/angular/services/modal.service";
import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { UserVerificationPromptComponent } from "@bitwarden/web-vault/app/components/user-verification-prompt.component";

import { SMPortingService } from "./sm-porting.service";

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
  });

  constructor(
    private route: ActivatedRoute,
    private i18nService: I18nService,
    private organizationService: OrganizationService,
    private userVerificationService: UserVerificationService,
    private platformUtilsService: PlatformUtilsService,
    private smPortingService: SMPortingService,
    private fileDownloadService: FileDownloadService,
    private logService: LogService,
    private modalService: ModalService
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

    const userVerified = await this.verifyUser();
    if (!userVerified) {
      return;
    }

    await this.doExport();
  };

  private async doExport() {
    try {
      const exportData = await this.smPortingService.export(
        this.orgId,
        this.formGroup.get("format").value
      );

      await this.downloadFile(exportData, this.formGroup.get("format").value);
      this.platformUtilsService.showToast("success", null, this.i18nService.t("dataExportSuccess"));
    } catch (e) {
      this.logService.error(e);
    }
  }

  private async downloadFile(data: string, format: string) {
    const fileName = await this.smPortingService.getFileName(null, format);
    this.fileDownloadService.download({
      fileName: fileName,
      blobData: data,
      blobOptions: { type: "text/plain" },
    });
  }

  private verifyUser() {
    const ref = this.modalService.open(UserVerificationPromptComponent, {
      allowMultipleModals: true,
      data: {
        confirmDescription: "exportWarningDesc",
        confirmButtonText: "exportVault",
        modalTitle: "confirmVaultExport",
      },
    });

    if (ref == null) {
      return;
    }

    return ref.onClosedPromise();
  }
}
