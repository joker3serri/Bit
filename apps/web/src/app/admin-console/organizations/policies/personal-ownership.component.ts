import { Component } from "@angular/core";
import { UntypedFormBuilder } from "@angular/forms";

import { PolicyType } from "@bitwarden/common/admin-console/enums";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class PersonalOwnershipPolicy extends BasePolicy {
  name = "personalOwnership";
  description = "personalOwnershipPolicyDesc";
  type = PolicyType.PersonalOwnership;
  component = PersonalOwnershipPolicyComponent;
}

@Component({
  selector: "policy-personal-ownership",
  templateUrl: "personal-ownership.component.html",
})
export class PersonalOwnershipPolicyComponent extends BasePolicyComponent {
  constructor(private formBuilder: UntypedFormBuilder) {
    super();
  }

  data = this.formBuilder.group({
    enabled: false,
  });
}
