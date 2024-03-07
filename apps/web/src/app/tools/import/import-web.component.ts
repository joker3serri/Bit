import { Component } from "@angular/core";
import { Router } from "@angular/router";

import { CollectionService } from "@bitwarden/common/vault/abstractions/collection.service";
import { ImportComponent } from "@bitwarden/importer/ui";

import { ImportCollectionService } from "../../../../../../libs/importer/src/services/import-collection.service";
import { ImportCollectionServiceAbstraction } from "../../../../../../libs/importer/src/services/import-collection.service.abstraction";
import { HeaderModule } from "../../layouts/header/header.module";
import { SharedModule } from "../../shared";

@Component({
  templateUrl: "import-web.component.html",
  standalone: true,
  imports: [SharedModule, ImportComponent, HeaderModule],
  providers: [
    {
      provide: ImportCollectionServiceAbstraction,
      useClass: ImportCollectionService,
      deps: [CollectionService],
    },
  ],
})
export class ImportWebComponent {
  protected loading = false;
  protected disabled = false;

  constructor(private router: Router) {}

  /**
   * Callback that is called after a successful import.
   */
  protected async onSuccessfulImport(organizationId: string): Promise<void> {
    await this.router.navigate(["vault"]);
  }
}
