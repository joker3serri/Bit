import { Component, Input } from "@angular/core";

export enum ReportType {
  ExposedPasswords = "ExposedPasswords",
  ReusedPasswords = "ReusedPasswords",
  WeakPasswords = "WeakPasswords",
  UnsecuredWebsites = "UnsecuredWebsites",
  Inactive2fa = "Inactive2fa",
  DataBreach = "DataBreach",
}

export enum ReportVariant {
  Enabled = "Enabled",
  RequiresPremium = "RequiresPremium",
  RequiresUpgrade = "RequiresUpgrade",
}

@Component({
  selector: "app-report-card",
  templateUrl: "report-card.component.html",
})
export class ReportCardComponent {
  @Input() title: string;
  @Input() description: string;
  @Input() route: string;
  @Input() iconName: string;
  @Input() type: ReportType;
  @Input() variant: ReportVariant;

  protected get disabled() {
    return this.variant != ReportVariant.Enabled;
  }

  protected get requiresPremium() {
    return this.variant == ReportVariant.RequiresPremium;
  }
}
