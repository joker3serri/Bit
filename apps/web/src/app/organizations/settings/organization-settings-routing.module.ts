import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { canAccessSettingsTab } from "@bitwarden/common/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/models/domain/organization";

import { OrganizationPermissionsGuard } from "../guards/org-permissions.guard";
import { OrganizationRedirectGuard } from "../guards/org-redirect.guard";
import { PoliciesComponent } from "../policies";

import { AccountComponent } from "./account.component";
import { SettingsComponent } from "./settings.component";
import { TwoFactorSetupComponent } from "./two-factor-setup.component";

const routes: Routes = [
  {
    path: "",
    component: SettingsComponent,
    canActivate: [OrganizationPermissionsGuard],
    data: { organizationPermissions: canAccessSettingsTab },
    children: [
      {
        path: "",
        pathMatch: "full",
        canActivate: [OrganizationRedirectGuard],
        data: {
          autoRedirectCallback: getSettingsRoute,
        },
        children: [], // This is required to make the auto redirect work,
      },
      { path: "account", component: AccountComponent, data: { titleId: "organizationInfo" } },
      {
        path: "two-factor",
        component: TwoFactorSetupComponent,
        data: { titleId: "twoStepLogin" },
      },
      {
        path: "policies",
        component: PoliciesComponent,
        canActivate: [OrganizationPermissionsGuard],
        data: {
          organizationPermissions: (org: Organization) => org.canManagePolicies,
          titleId: "policies",
        },
      },
      {
        path: "tools",
        loadChildren: () =>
          import("../tools/import-export/org-import-export.module").then(
            (m) => m.OrganizationImportExportModule
          ),
      },
    ],
  },
];

function getSettingsRoute(organization: Organization) {
  let route: string | string[];
  switch (true) {
    case organization.isOwner:
      route = "account";
      break;
    case organization.canManagePolicies:
      route = "policies";
      break;
    case organization.canAccessImportExport:
      route = ["tools", "import"];
      break;
    case organization.canManageSso:
      route = "sso";
      break;
    case organization.canManageScim:
      route = "scim";
      break;
  }
  return route;
}

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationSettingsRoutingModule {}
