import { Component, Input } from "@angular/core";

import { ValidationService } from "@bitwarden/common/abstractions/validation.service";

import { BaseAccessPolicyView } from "../../models/view/access-policy.view";
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

  async deleteAccessPolicy(accessPolicyId: string): Promise<void> {
    try {
      await this.accessPolicyService.deleteAccessPolicy(accessPolicyId);
    } catch (e) {
      this.validationService.showError(e);
    }
  }
}
