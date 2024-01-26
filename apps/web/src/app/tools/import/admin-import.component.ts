import { Component } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { CollectionService } from "@bitwarden/common/vault/abstractions/collection.service";
import { ImportCollectionServiceAbstraction } from "@bitwarden/importer/core";
import { ImportComponent } from "@bitwarden/importer/ui";

import { SharedModule } from "../../shared";

import { ImportCollectionAdminService } from "./import-collection-admin.service";
import { ImportWebComponent } from "./import-web.component";

@Component({
  templateUrl: "import-web.component.html",
  standalone: true,
  imports: [SharedModule, ImportComponent],
  providers: [
    {
      provide: ImportCollectionServiceAbstraction,
      useClass: ImportCollectionAdminService,
      deps: [CollectionService, ApiService],
    },
  ],
})
export class AdminImportComponent extends ImportWebComponent {}
