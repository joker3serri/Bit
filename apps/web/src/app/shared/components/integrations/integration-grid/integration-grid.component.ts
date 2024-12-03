import { Component, Input } from "@angular/core";

import { IntegrationType } from "@bitwarden/common/enums";

import { Integration } from "../models";

@Component({
  selector: "integration-grid",
  templateUrl: "./integration-grid.component.html",
})
export class IntegrationGridComponent {
  @Input() integrations: Integration[];

  protected IntegrationType = IntegrationType;
}
