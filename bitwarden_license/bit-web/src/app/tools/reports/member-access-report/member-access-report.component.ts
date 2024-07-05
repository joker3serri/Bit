import { Component, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { debounceTime, firstValueFrom } from "rxjs";

import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { FileDownloadService } from "@bitwarden/common/platform/abstractions/file-download/file-download.service";
import { StateProvider } from "@bitwarden/common/platform/state";
import { OrganizationId } from "@bitwarden/common/types/guid";
import { SearchModule, TableDataSource } from "@bitwarden/components";
import { HeaderModule } from "@bitwarden/web-vault/app/layouts/header/header.module";
import { SharedModule } from "@bitwarden/web-vault/app/shared";
import { exportToCSV } from "@bitwarden/web-vault/app/tools/reports/report-utils";

import { ExportHelper } from "../../../../../../../libs/tools/export/vault-export/vault-export-core/src/services/export-helper";

import { MemberAccessReportService } from "./member-access-report.service";
import {
  MemberAccessReportView,
  generateMemberAccessReportView,
  generateUserReportExportItems,
  userReportItemHeaders,
} from "./view/member-access-report.view";

@Component({
  selector: "member-access-report",
  templateUrl: "member-access-report.component.html",
  imports: [SharedModule, SearchModule, HeaderModule],
  standalone: true,
})
export class MemberAccessReportComponent implements OnInit {
  protected dataSource = new TableDataSource<MemberAccessReportView>();
  protected searchControl = new FormControl("", { nonNullable: true });
  protected organizationId: OrganizationId;

  constructor(
    private route: ActivatedRoute,
    protected reportService: MemberAccessReportService,
    protected fileDownloadService: FileDownloadService,
    protected encryptService: EncryptService,
    protected cryptoService: CryptoService,
    protected stateProvider: StateProvider,
  ) {
    // Connect the search input to the table dataSource filter input
    this.searchControl.valueChanges
      .pipe(debounceTime(200), takeUntilDestroyed())
      .subscribe((v) => (this.dataSource.filter = v));
  }

  async ngOnInit() {
    const params = await firstValueFrom(this.route.params);
    this.organizationId = params.organizationId;
    this.dataSource.data = generateMemberAccessReportView(
      this.reportService.getMemberAccessMockData(),
    );
  }

  exportReportAction = async (): Promise<void> => {
    return exportToCSV(
      await generateUserReportExportItems(
        await this.reportService.getMemberAccessMockData(),
        this.organizationId,
      ),
      ExportHelper.getFileName("member-access"),
      this.fileDownloadService,
      userReportItemHeaders,
    );
  };
}
