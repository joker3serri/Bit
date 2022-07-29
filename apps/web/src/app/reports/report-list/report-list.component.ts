import { Component, Input } from "@angular/core";

import { ReportVariant } from "../report-card/report-card.component";

export type ReportEntry = {
  title: string;
  description: string;
  route: string;
  icon: string;
  variant: ReportVariant;
};

@Component({
  selector: "app-report-list",
  templateUrl: "report-list.component.html",
})
export class ReportListComponent {
  @Input() reports: ReportEntry[];
}
