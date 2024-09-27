import { Component } from "@angular/core";

import { CatchallSettingsComponent } from "./catchall-settings.component";
import { DependenciesModule } from "./dependencies";
import { PassphraseSettingsComponent } from "./passphrase-settings.component";
import { PasswordSettingsComponent } from "./password-settings.component";
import { SubaddressSettingsComponent } from "./subaddress-settings.component";
import { UsernameSettingsComponent } from "./username-settings.component";

@Component({
  standalone: true,
  selector: "tools-credential-generator",
  templateUrl: "credential-generator.component.html",
  imports: [
    DependenciesModule,
    CatchallSettingsComponent,
    SubaddressSettingsComponent,
    UsernameSettingsComponent,
    PasswordSettingsComponent,
    PassphraseSettingsComponent,
  ],
})
export class CredentialGeneratorComponent {}
