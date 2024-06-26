import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "@bitwarden/angular/auth/guards";
import { featureFlaggedRoute } from "@bitwarden/angular/platform/utils/feature-flagged-route";
import {
  canAccessOrgAdmin,
  canAccessGroupsTab,
  canAccessMembersTab,
  canAccessVaultTab,
  canAccessReportingTab,
  canAccessSettingsTab,
} from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";

import { OrganizationPermissionsGuard } from "../../admin-console/organizations/guards/org-permissions.guard";
import { OrganizationRedirectGuard } from "../../admin-console/organizations/guards/org-redirect.guard";
import { OrganizationLayoutComponent } from "../../admin-console/organizations/layouts/organization-layout.component";
import { GroupsComponent } from "../../admin-console/organizations/manage/groups.component";
import { NewGroupsComponent } from "../../admin-console/organizations/manage/new-groups.component";
import { deepLinkGuard } from "../../auth/guards/deep-link.guard";
import { VaultModule } from "../../vault/org-vault/vault.module";

const routes: Routes = [
  {
    path: ":organizationId",
    component: OrganizationLayoutComponent,
    canActivate: [deepLinkGuard(), AuthGuard, OrganizationPermissionsGuard],
    data: {
      organizationPermissions: canAccessOrgAdmin,
    },
    children: [
      {
        path: "",
        pathMatch: "full",
        canActivate: [OrganizationRedirectGuard],
        data: {
          autoRedirectCallback: getOrganizationRoute,
        },
        children: [], // This is required to make the auto redirect work, },
      },
      {
        path: "vault",
        loadChildren: () => VaultModule,
      },
      {
        path: "settings",
        loadChildren: () =>
          import("./settings/organization-settings.module").then(
            (m) => m.OrganizationSettingsModule,
          ),
      },
      {
        path: "members",
        loadChildren: () => import("./members").then((m) => m.MembersModule),
      },
      ...featureFlaggedRoute({
        defaultComponent: GroupsComponent,
        flaggedComponent: NewGroupsComponent,
        featureFlag: FeatureFlag.RefactorGroupsComponent,
        routeOptions: {
          path: "groups",
          canActivate: [OrganizationPermissionsGuard],
          data: {
            titleId: "groups",
            organizationPermissions: canAccessGroupsTab,
          },
        },
      }),
      {
        path: "reporting",
        loadChildren: () =>
          import("../organizations/reporting/organization-reporting.module").then(
            (m) => m.OrganizationReportingModule,
          ),
      },
      {
        path: "billing",
        loadChildren: () =>
          import("../../billing/organizations/organization-billing.module").then(
            (m) => m.OrganizationBillingModule,
          ),
      },
    ],
  },
];

function getOrganizationRoute(organization: Organization): string {
  if (canAccessVaultTab(organization)) {
    return "vault";
  }
  if (canAccessMembersTab(organization)) {
    return "members";
  }
  if (canAccessGroupsTab(organization)) {
    return "groups";
  }
  if (canAccessReportingTab(organization)) {
    return "reporting";
  }
  if (canAccessSettingsTab(organization)) {
    return "settings";
  }
  return undefined;
}

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class OrganizationsRoutingModule {}
