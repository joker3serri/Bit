import { Component } from "@angular/core";

import { SectionComponent } from "@bitwarden/components";
import {
  CatchallSettingsComponent,
  SubaddressSettingsComponent,
  UsernameSettingsComponent,
} from "@bitwarden/generator-components";

@Component({
  standalone: true,
  selector: "credential-generator",
  templateUrl: "credential-generator.component.html",
  imports: [
    CatchallSettingsComponent,
    SubaddressSettingsComponent,
    UsernameSettingsComponent,
    SectionComponent,
  ],
})
export class CredentialGeneratorComponent {}
