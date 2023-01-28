import { Component, OnDestroy, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Subject, switchMap, takeUntil } from "rxjs";
import Swal, { SweetAlertIcon } from "sweetalert2";

import { FileDownloadService } from "@bitwarden/common/abstractions/fileDownload/fileDownload.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification/userVerification.service.abstraction";
import { ImportType } from "@bitwarden/common/enums/importOptions";
import { ImportError } from "@bitwarden/common/importers/import-error";

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
  formPromise: Promise<ImportError>;
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
    private smPortingService: SMPortingService
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
      this.formPromise = this.smPortingService.import(this.orgId, fileContents);
      const error = await this.formPromise;

      if (error != null) {
        this.error(error);
        this.loading = false;
        return;
      }

      //No errors, display success message
      this.platformUtilsService.showToast("success", null, this.i18nService.t("importSuccess"));
    } catch (e) {
      this.logService.error(e);
    }

    this.loading = false;
  }

  setSelectedFile(event: Event) {
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
    await Swal.fire({
      heightAuto: false,
      buttonsStyling: false,
      icon: "error" as SweetAlertIcon,
      iconHtml: `<i class="swal-custom-icon bwi bwi-error text-danger"></i>`,
      input: "textarea",
      inputValue: error.message,
      inputAttributes: {
        readonly: "true",
      },
      titleText: this.i18nService.t("importError"),
      text: this.i18nService.t("importErrorDesc"),
      showConfirmButton: true,
      confirmButtonText: this.i18nService.t("ok"),
      onOpen: (popupEl: any) => {
        popupEl.querySelector(".swal2-textarea").scrollTo(0, 0);
      },
    });
  }
}
