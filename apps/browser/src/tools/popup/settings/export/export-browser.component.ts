import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { Router, RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { AsyncActionsModule, ButtonModule, DialogModule } from "@bitwarden/components";
import { ExportComponent } from "@bitwarden/vault-export-ui";

@Component({
  templateUrl: "export-browser.component.html",
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    JslibModule,
    DialogModule,
    AsyncActionsModule,
    ButtonModule,
    ExportComponent,
  ],
})
export class ExportBrowserComponent {
  protected disabled = false;
  protected loading = false;

  constructor(private router: Router) {}

  protected async onSuccessfulExport(organizationId: string): Promise<void> {
    await this.router.navigate(["/vault-settings"]);
  }
}
