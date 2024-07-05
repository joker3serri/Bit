import { Injectable } from "@angular/core";

import { memberAccessReports } from "./member-access-report.mock";
import { MemberAccessReportModel } from "./view/member-access-report.view";

@Injectable({ providedIn: "root" })
export class MemberAccessReportService {
  //Temporary method to provide mock data for test purposes only
  getMemberAccessMockData(): MemberAccessReportModel[] {
    return memberAccessReports;
  }
}
