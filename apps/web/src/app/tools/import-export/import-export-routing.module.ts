import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { ExportComponent } from "./export.component";
import { ImportWebComponent } from "./import-web.component";

const routes: Routes = [
  {
    path: "import",
    component: ImportWebComponent,
    data: { titleId: "importData" },
  },
  {
    path: "export",
    component: ExportComponent,
    data: { titleId: "exportVault" },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class ImportExportRoutingModule {}
