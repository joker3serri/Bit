import { Component, Input } from "@angular/core";

import { ValidationService } from "@bitwarden/common/abstractions/validation.service";

import { ProjectAccessPoliciesView } from "../../models/view/project-access-policies.view";

import { AccessPolicyService } from "./access-policy.service";

@Component({
  selector: "sm-access-policies",
  templateUrl: "./access-policies.component.html",
})
export class AccessPoliciesComponent {
  @Input() columnTitle: string;
  @Input() emptyMessage: string;
  @Input() tableType: "projectPeople" | "projectServiceAccounts";
  @Input() projectAccessPolicies: ProjectAccessPoliciesView;

  constructor(
    private accessPolicyService: AccessPolicyService,
    private validationService: ValidationService
  ) {}

  async updateAccessPolicy(target: any, accessPolicyId: string) {
    try {
      let read: boolean;
      let write: boolean;
      if (target.value == "readOnly") {
        read = true;
        write = false;
      } else if (target.value == "writeOnly") {
        read = false;
        write = true;
      } else if (target.value == "readAndWrite") {
        read = true;
        write = true;
      }

      await this.accessPolicyService.updateAccessPolicy(accessPolicyId, read, write);
    } catch (e) {
      this.validationService.showError(e);
    }
  }

  async deleteAccessPolicy(accessPolicyId: string) {
    try {
      await this.accessPolicyService.deleteAccessPolicy(accessPolicyId);
    } catch (e) {
      this.validationService.showError(e);
    }
  }
}
