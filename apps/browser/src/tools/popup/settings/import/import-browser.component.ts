import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router, RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AsyncActionsModule, ButtonModule, DialogModule } from "@bitwarden/components";
import { ImportComponent } from "@bitwarden/importer/ui";

import { FilePopoutCalloutComponent } from "../../components/file-popout-callout.component";
@Component({
  templateUrl: "import-browser.component.html",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    JslibModule,
    DialogModule,
    AsyncActionsModule,
    ButtonModule,
    ImportComponent,
    FilePopoutCalloutComponent,
  ],
})
export class ImportBrowserComponent {
  protected disabled = false;
  protected loading = false;

  constructor(private router: Router) {}

  protected async onSuccessfulImport(organizationId: string): Promise<void> {
    this.router.navigate(["/tabs/settings"]);
  }
}
