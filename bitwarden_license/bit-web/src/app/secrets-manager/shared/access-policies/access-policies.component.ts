import { Component, Input, OnInit } from "@angular/core";
import { Observable, map } from "rxjs";

import { ValidationService } from "@bitwarden/common/abstractions/validation.service";

import { BaseAccessPolicyView } from "../../models/view/access-policy.view";
import { ProjectAccessPoliciesView } from "../../models/view/project-access-policies.view";

import { AccessPolicyService } from "./access-policy.service";

type RowData = {
  type: "user" | "group" | "serviceAccount";
  name: string;
  id: string;
  read: boolean;
  write: boolean;
  icon: string;
};

@Component({
  selector: "sm-access-policies",
  templateUrl: "./access-policies.component.html",
})
export class AccessPoliciesComponent implements OnInit {
  @Input() tableType: "projectPeople" | "projectServiceAccounts";
  @Input() columnTitle: string;
  @Input() emptyMessage: string;
  @Input() projectAccessPolicies: ProjectAccessPoliciesView;
  @Input() projectAccessPolicies$: Observable<ProjectAccessPoliciesView>;

  constructor(
    private accessPolicyService: AccessPolicyService,
    private validationService: ValidationService
  ) {}

  protected rowData$: Observable<RowData[]>;

  ngOnInit() {
    this.rowData$ = this.projectAccessPolicies$.pipe(
      map((policies) => {
        const rowData: RowData[] = [];

        if (this.tableType == "projectPeople") {
          policies.userAccessPolicies.forEach((policy) => {
            rowData.push({
              type: "user",
              name: policy.organizationUserName,
              id: policy.id,
              read: policy.read,
              write: policy.write,
              icon: "bwi bwi-user tw-text-xl tw-text-muted",
            });
          });

          policies.groupAccessPolicies.forEach((policy) => {
            rowData.push({
              type: "group",
              name: policy.groupName,
              id: policy.id,
              read: policy.read,
              write: policy.write,
              icon: "bwi bwi-family tw-text-xl tw-text-muted",
            });
          });
        }

        if (this.tableType == "projectServiceAccounts") {
          policies.serviceAccountAccessPolicies.forEach((policy) => {
            rowData.push({
              type: "serviceAccount",
              name: policy.serviceAccountName,
              id: policy.id,
              read: policy.read,
              write: policy.write,
              icon: "bwi bwi-wrench tw-text-xl tw-text-muted",
            });
          });
        }
        return rowData;
      })
    );
  }

  async updateAccessPolicy(target: any, accessPolicyId: string): Promise<void> {
    try {
      const accessPolicyView = new BaseAccessPolicyView();
      accessPolicyView.id = accessPolicyId;
      if (target.value == "canRead") {
        accessPolicyView.read = true;
        accessPolicyView.write = false;
      } else if (target.value == "canWrite") {
        accessPolicyView.read = false;
        accessPolicyView.write = true;
      } else if (target.value == "canReadWrite") {
        accessPolicyView.read = true;
        accessPolicyView.write = true;
      }

      await this.accessPolicyService.updateAccessPolicy(accessPolicyView);
    } catch (e) {
      this.validationService.showError(e);
    }
  }

  delete = (accessPolicyId: string) => async () => {
    await this.accessPolicyService.deleteAccessPolicy(accessPolicyId);
  };
}
