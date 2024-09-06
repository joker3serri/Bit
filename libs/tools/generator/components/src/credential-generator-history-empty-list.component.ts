import { Component } from "@angular/core";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { NoItemsModule } from "@bitwarden/components";

import { NoCredentialsIcon } from "./icons/no-credentials.icon";

@Component({
  standalone: true,
  selector: "tools-credential-generator-history-empty-list",
  templateUrl: "credential-generator-history-empty-list.component.html",
  imports: [NoItemsModule, JslibModule],
})
export class CredentialGeneratorHistoryEmptyListComponent {
  noCredentialsIcon = NoCredentialsIcon;
  constructor() {}
}
