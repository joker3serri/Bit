import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { Permissions } from "@bitwarden/common/enums/permissions";

import { PermissionsGuard } from "../../organizations/guards/permissions.guard";
import { NavigationPermissionsService } from "../../organizations/services/navigation-permissions.service";

import { AccountComponent } from "./components/account.component";
import { PoliciesComponent } from "./components/policies.component";
import { TwoFactorSetupComponent } from "./components/two-factor-setup.component";
import { SettingsComponent } from "./settings.component";

const routes: Routes = [
  {
    path: "",
    component: SettingsComponent,
    canActivate: [PermissionsGuard],
    data: { permissions: NavigationPermissionsService.getPermissions("settings") },
    children: [
      { path: "", pathMatch: "full", redirectTo: "account" },
      { path: "account", component: AccountComponent, data: { titleId: "organizationInfo" } },
      {
        path: "two-factor",
        component: TwoFactorSetupComponent,
        data: { titleId: "twoStepLogin" },
      },
      {
        path: "policies",
        component: PoliciesComponent,
        canActivate: [PermissionsGuard],
        data: {
          permissions: [Permissions.ManagePolicies],
          titleId: "policies",
        },
      },
    ],
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationSettingsRoutingModule {}
