import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";

import { Organization } from "@bitwarden/common/models/domain/organization";

export interface OrgUpgradeDialogData {
  org: Organization;
}

@Component({
  selector: "app-org-upgrade-dialog",
  templateUrl: "org-upgrade-dialog.component.html",
})
export class OrgUpgradeDialogComponent {
  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: OrgUpgradeDialogData
  ) {}
}
