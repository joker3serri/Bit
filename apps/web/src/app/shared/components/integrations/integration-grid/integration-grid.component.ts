import { Component, Input } from "@angular/core";

import { IntegrationType } from "@bitwarden/common/enums";

import { Integration } from "../models";
import { IntegrationCardComponent } from "../integration-card/integration-card.component";
import { SharedModule } from "../../../shared.module";
import { CommonModule } from "@angular/common";

@Component({
  selector: "app-integration-grid",
  templateUrl: "./integration-grid.component.html",
  standalone: true,
  imports: [IntegrationCardComponent, SharedModule, CommonModule],
})
export class IntegrationGridComponent {
  @Input() integrations: Integration[];

  protected IntegrationType = IntegrationType;
}
