import { NgModule } from "@angular/core";

import { SharedModule } from "../modules/shared.module";

import { BreachReportComponent } from "./breach-report.component";
import { ExposedPasswordsReportComponent } from "./exposed-passwords-report.component";
import { InactiveTwoFactorReportComponent } from "./inactive-two-factor-report.component";
import { ReportCardComponent } from "./report-card/report-card.component";
import { ReportListComponent } from "./report-list/report-list.component";
import { ReportsHomeComponent } from "./reports-home.component";
import { ReportsRoutingModule } from "./reports-routing.module";
import { ReportsComponent } from "./reports.component";
import { ReusedPasswordsReportComponent } from "./reused-passwords-report.component";
import { UnsecuredWebsitesReportComponent } from "./unsecured-websites-report.component";
import { WeakPasswordsReportComponent } from "./weak-passwords-report.component";

@NgModule({
  imports: [SharedModule, ReportsRoutingModule],
  declarations: [
    BreachReportComponent,
    ExposedPasswordsReportComponent,
    InactiveTwoFactorReportComponent,
    ReportCardComponent,
    ReportListComponent,
    ReportsComponent,
    ReportsHomeComponent,
    ReusedPasswordsReportComponent,
    UnsecuredWebsitesReportComponent,
    WeakPasswordsReportComponent,
    WeakPasswordsReportComponent,
  ],
  exports: [],
})
export class ReportsModule {}
