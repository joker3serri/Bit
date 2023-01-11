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

  updateAccessPolicy(target: any, accessPolicyId: string) {
    //console.log(target.value);
    //console.log(accessPolicyId);
    // TODO make service call to update accessPolicy type
  }

  async deleteAccessPolicy(accessPolicyId: string) {
    try {
      await this.accessPolicyService.deleteAccessPolicy(accessPolicyId);
    } catch (e) {
      this.validationService.showError(e);
    }
  }
}
