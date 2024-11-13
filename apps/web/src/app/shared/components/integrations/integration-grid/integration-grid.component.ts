import { Component, Input } from "@angular/core";

import { IntegrationType } from "@bitwarden/common/enums";

import { SharedModule } from "../../../shared.module";
import { IntegrationCardComponent } from "../integration-card/integration-card.component";
import { Integration } from "../models";

@Component({
  selector: "app-integration-grid",
  templateUrl: "./integration-grid.component.html",
  standalone: true,
  imports: [IntegrationCardComponent, SharedModule],
})
export class IntegrationGridComponent {
  @Input() integrations: Integration[];

  protected IntegrationType = IntegrationType;
}
