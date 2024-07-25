import { Component } from "@angular/core";
import { UntypedFormBuilder, Validators } from "@angular/forms";

import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { DefaultPassphraseBoundaries, DefaultPasswordBoundaries } from "@bitwarden/generator-core";

import { BasePolicy, BasePolicyComponent } from "./base-policy.component";

export class PasswordGeneratorPolicy extends BasePolicy {
  name = "passwordGenerator";
  description = "passwordGeneratorPolicyDesc";
  type = PolicyType.PasswordGenerator;
  component = PasswordGeneratorPolicyComponent;
}

@Component({
  selector: "policy-password-generator",
  templateUrl: "password-generator.component.html",
})
export class PasswordGeneratorPolicyComponent extends BasePolicyComponent {
  data = this.formBuilder.group({
    overridePasswordType: [null],
    minLength: [
      null,
      [
        Validators.min(DefaultPasswordBoundaries.length.min),
        Validators.max(DefaultPasswordBoundaries.length.max),
      ],
    ],
    useUpper: [null],
    useLower: [null],
    useNumbers: [null],
    useSpecial: [null],
    minNumbers: [
      null,
      [
        Validators.min(DefaultPasswordBoundaries.minDigits.min),
        Validators.max(DefaultPasswordBoundaries.minDigits.max),
      ],
    ],
    minSpecial: [
      null,
      [
        Validators.min(DefaultPasswordBoundaries.minSpecialCharacters.min),
        Validators.max(DefaultPasswordBoundaries.minSpecialCharacters.max),
      ],
    ],
    minNumberWords: [
      null,
      [
        Validators.min(DefaultPassphraseBoundaries.numWords.min),
        Validators.max(DefaultPassphraseBoundaries.numWords.max),
      ],
    ],
    capitalize: [null],
    includeNumber: [null],
  });

  overridePasswordTypeOptions: { name: string; value: string }[];

  constructor(
    private formBuilder: UntypedFormBuilder,
    i18nService: I18nService,
  ) {
    super();

    this.overridePasswordTypeOptions = [
      { name: i18nService.t("userPreference"), value: null },
      { name: i18nService.t("password"), value: "password" },
      { name: i18nService.t("passphrase"), value: "passphrase" },
    ];
  }
}
