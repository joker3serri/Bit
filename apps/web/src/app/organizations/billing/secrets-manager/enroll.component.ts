import { Component, Input } from "@angular/core";
import { FormBuilder } from "@angular/forms";

import { flagEnabled } from "../../../../utils/flags";

@Component({
  selector: "sm-enroll",
  templateUrl: "enroll.component.html",
})
export class SecretsManagerEnrollComponent {
  formGroup = this.formBuilder.group({
    enabled: [false],
  });

  showSecretsManager = false;

  @Input() enabled: boolean;

  constructor(private formBuilder: FormBuilder) {
    this.showSecretsManager = flagEnabled("secretsManager");
  }

  submit = async () => {
    this.formGroup.markAllAsTouched();

    // Promise timeout
    await new Promise((resolve) => setTimeout(resolve, 1000));
  };
}
