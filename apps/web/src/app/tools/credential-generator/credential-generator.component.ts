import { Component } from "@angular/core";

import { PasswordGeneratorComponent } from "@bitwarden/generator-components";

import { HeaderModule } from "../../layouts/header/header.module";
import { SharedModule } from "../../shared";

@Component({
  standalone: true,
  selector: "credential-generator",
  templateUrl: "credential-generator.component.html",
  imports: [SharedModule, HeaderModule, PasswordGeneratorComponent],
})
export class CredentialGeneratorComponent {}
