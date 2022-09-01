import { Icons } from "@bitwarden/components";

import { ReportEntry } from "./models/report-entry";


export enum ReportType {
  ExposedPasswords = "exposedPasswords",
  ReusedPasswords = "reusedPasswords",
  WeakPasswords = "weakPasswords",
  UnsecuredWebsites = "unsecuredWebsites",
  Inactive2fa = "inactive2fa",
  DataBreach = "dataBreach",
}

type ReportWithoutVariant = Omit<ReportEntry, "variant">;

export const reports: Record<ReportType, ReportWithoutVariant> = {
  [ReportType.ExposedPasswords]: {
    title: "exposedPasswordsReport",
    description: "exposedPasswordsReportDesc",
    route: "exposed-passwords-report",
    icon: Icons.ReportExposedPasswords,
  },
  [ReportType.ReusedPasswords]: {
    title: "reusedPasswordsReport",
    description: "reusedPasswordsReportDesc",
    route: "reused-passwords-report",
    icon: Icons.ReportReusedPasswords,
  },
  [ReportType.WeakPasswords]: {
    title: "weakPasswordsReport",
    description: "weakPasswordsReportDesc",
    route: "weak-passwords-report",
    icon: Icons.ReportWeakPasswords,
  },
  [ReportType.UnsecuredWebsites]: {
    title: "unsecuredWebsitesReport",
    description: "unsecuredWebsitesReportDesc",
    route: "unsecured-websites-report",
    icon: Icons.ReportUnsecuredWebsites,
  },
  [ReportType.Inactive2fa]: {
    title: "inactive2faReport",
    description: "inactive2faReportDesc",
    route: "inactive-two-factor-report",
    icon: Icons.ReportInactiveTwoFactor,
  },
  [ReportType.DataBreach]: {
    title: "dataBreachReport",
    description: "breachDesc",
    route: "breach-report",
    icon: Icons.ReportBreach,
  },
};
