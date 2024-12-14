import { DIALOG_DATA } from "@angular/cdk/dialog";
import { CommonModule } from "@angular/common";
import { Component, Inject } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { MemberDetailsFlat } from "@bitwarden/bit-common/tools/reports/risk-insights/models/password-health";
import { ButtonModule, DialogModule, DialogService } from "@bitwarden/components";

type AtRiskMemberDetailsDialogParams = {
  members: MemberDetailsFlat[];
  applicationName: string;
};

export const openAtRiskMemberDetailsDialog = (
  dialogService: DialogService,
  dialogConfig: AtRiskMemberDetailsDialogParams,
) =>
  dialogService.open<boolean, AtRiskMemberDetailsDialogParams>(AtRiskMemberDetailsDialogComponent, {
    data: dialogConfig,
  });

@Component({
  standalone: true,
  templateUrl: "./at-risk-member-details-dialog.component.html",
  imports: [ButtonModule, CommonModule, JslibModule, DialogModule],
})
export class AtRiskMemberDetailsDialogComponent {
  protected members: MemberDetailsFlat[];
  protected applicationName: string;

  constructor(@Inject(DIALOG_DATA) private params: AtRiskMemberDetailsDialogParams) {
    this.members = params.members;
    this.applicationName = params.applicationName;
  }
}
