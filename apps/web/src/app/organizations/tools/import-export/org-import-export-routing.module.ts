import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { Organization } from "@bitwarden/common/models/domain/organization";

import { PermissionsGuard } from "../../guards/permissions.guard";

import { OrganizationExportComponent } from "./org-export.component";
import { OrganizationImportComponent } from "./org-import.component";

const routes: Routes = [
  {
    path: "import",
    component: OrganizationImportComponent,
    canActivate: [PermissionsGuard],
    data: {
      titleId: "importData",
      permissions: (org: Organization) => org.canAccessImportExport,
    },
  },
  {
    path: "export",
    component: OrganizationExportComponent,
    canActivate: [PermissionsGuard],
    data: {
      titleId: "exportVault",
      permissions: (org: Organization) => org.canAccessImportExport,
    },
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
})
export class OrganizationImportExportRoutingModule {}
