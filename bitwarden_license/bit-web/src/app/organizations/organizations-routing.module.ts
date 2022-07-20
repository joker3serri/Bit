import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "@bitwarden/angular/guards/auth.guard";
import { Permissions } from "@bitwarden/common/enums/permissions";

import { PermissionsGuard } from "src/app/organizations/guards/permissions.guard";
import { OrganizationLayoutComponent } from "src/app/organizations/layouts/organization-layout.component";
import { NavigationPermissionsService } from "src/app/organizations/services/navigation-permissions.service";
import { SettingsComponent } from "src/app/organizations/settings/settings.component";

import { ScimComponent } from "./manage/scim.component";
import { SsoComponent } from "./manage/sso.component";

const routes: Routes = [
  {
    path: "organizations/:organizationId",
    component: OrganizationLayoutComponent,
    canActivate: [AuthGuard, PermissionsGuard],
    children: [
      {
        path: "settings",
        component: SettingsComponent,
        canActivate: [PermissionsGuard],
        data: {
          permissions: NavigationPermissionsService.getPermissions("settings"),
        },
        children: [
          {
            path: "sso",
            component: SsoComponent,
            canActivate: [PermissionsGuard],
            data: {
              permissions: [Permissions.ManageSso],
            },
          },
          {
            path: "scim",
            component: ScimComponent,
            canActivate: [PermissionsGuard],
            data: {
              permissions: [Permissions.ManageScim],
            },
          },
        ],
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
