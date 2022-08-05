import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { AuthGuard } from "@bitwarden/angular/guards/auth.guard";
import { Organization } from "@bitwarden/common/models/domain/organization";

import { PermissionsGuard } from "./guards/permissions.guard";
import { OrganizationLayoutComponent } from "./layouts/organization-layout.component";
import { CollectionsComponent } from "./manage/collections.component";
import { EventsComponent } from "./manage/events.component";
import { GroupsComponent } from "./manage/groups.component";
import { ManageComponent } from "./manage/manage.component";
import { PeopleComponent } from "./manage/people.component";
import { PoliciesComponent } from "./manage/policies.component";
import { AccountComponent } from "./settings/account.component";
import { OrganizationBillingComponent } from "./settings/organization-billing.component";
import { OrganizationSubscriptionComponent } from "./settings/organization-subscription.component";
import { SettingsComponent } from "./settings/settings.component";
import { TwoFactorSetupComponent } from "./settings/two-factor-setup.component";
import { ExposedPasswordsReportComponent } from "./tools/exposed-passwords-report.component";
import { InactiveTwoFactorReportComponent } from "./tools/inactive-two-factor-report.component";
import { ReusedPasswordsReportComponent } from "./tools/reused-passwords-report.component";
import { ToolsComponent } from "./tools/tools.component";
import { UnsecuredWebsitesReportComponent } from "./tools/unsecured-websites-report.component";
import { WeakPasswordsReportComponent } from "./tools/weak-passwords-report.component";
import { VaultModule } from "./vault/vault.module";

export function canAccessToolsTab(org: Organization): boolean {
  return org.canAccessImportExport || org.canAccessReports;
}

export function canAccessSettingsTab(org: Organization): boolean {
  return org.isOwner;
}

export function canAccessManageTab(org: Organization): boolean {
  return (
    org.canCreateNewCollections ||
    org.canEditAnyCollection ||
    org.canDeleteAnyCollection ||
    org.canEditAssignedCollections ||
    org.canDeleteAssignedCollections ||
    org.canAccessEventLogs ||
    org.canManageGroups ||
    org.canManageUsers ||
    org.canManagePolicies ||
    org.canManageSso ||
    org.canManageScim
  );
}

export function canAccessOrgAdmin(org: Organization): boolean {
  return canAccessToolsTab(org) || canAccessSettingsTab(org) || canAccessManageTab(org);
}

const routes: Routes = [
  {
    path: ":organizationId",
    component: OrganizationLayoutComponent,
    canActivate: [AuthGuard, PermissionsGuard],
    data: {
      permissions: canAccessOrgAdmin,
    },
    children: [
      { path: "", pathMatch: "full", redirectTo: "vault" },
      {
        path: "vault",
        loadChildren: () => VaultModule,
      },
      {
        path: "tools",
        component: ToolsComponent,
        canActivate: [PermissionsGuard],
        data: {
          permissions: canAccessToolsTab,
        },
        children: [
          {
            path: "",
            pathMatch: "full",
            redirectTo: "import",
          },
          {
            path: "",
            loadChildren: () =>
              import("./tools/import-export/org-import-export.module").then(
                (m) => m.OrganizationImportExportModule
              ),
          },
          {
            path: "exposed-passwords-report",
            component: ExposedPasswordsReportComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "exposedPasswordsReport",
              permissions: (org: Organization) => org.canAccessReports,
            },
          },
          {
            path: "inactive-two-factor-report",
            component: InactiveTwoFactorReportComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "inactive2faReport",
              permissions: (org: Organization) => org.canAccessReports,
            },
          },
          {
            path: "reused-passwords-report",
            component: ReusedPasswordsReportComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "reusedPasswordsReport",
              permissions: (org: Organization) => org.canAccessReports,
            },
          },
          {
            path: "unsecured-websites-report",
            component: UnsecuredWebsitesReportComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "unsecuredWebsitesReport",
              permissions: (org: Organization) => org.canAccessReports,
            },
          },
          {
            path: "weak-passwords-report",
            component: WeakPasswordsReportComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "weakPasswordsReport",
              permissions: (org: Organization) => org.canAccessReports,
            },
          },
        ],
      },
      {
        path: "manage",
        component: ManageComponent,
        canActivate: [PermissionsGuard],
        data: {
          permissions: canAccessManageTab,
        },
        children: [
          {
            path: "",
            pathMatch: "full",
            redirectTo: "people",
          },
          {
            path: "collections",
            component: CollectionsComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "collections",
              permissions: (org: Organization) =>
                org.canCreateNewCollections ||
                org.canEditAnyCollection ||
                org.canDeleteAnyCollection ||
                org.canEditAssignedCollections ||
                org.canDeleteAssignedCollections,
            },
          },
          {
            path: "events",
            component: EventsComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "eventLogs",
              permissions: (org: Organization) => org.canAccessEventLogs,
            },
          },
          {
            path: "groups",
            component: GroupsComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "groups",
              permissions: (org: Organization) => org.canManageGroups,
            },
          },
          {
            path: "people",
            component: PeopleComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "people",
              permissions: (org: Organization) => org.canManageUsers || org.canManageUsersPassword,
            },
          },
          {
            path: "policies",
            component: PoliciesComponent,
            canActivate: [PermissionsGuard],
            data: {
              titleId: "policies",
              permissions: (org: Organization) => org.canManagePolicies,
            },
          },
        ],
      },
      {
        path: "settings",
        component: SettingsComponent,
        canActivate: [PermissionsGuard],
        data: { permissions: canAccessSettingsTab },
        children: [
          { path: "", pathMatch: "full", redirectTo: "account" },
          { path: "account", component: AccountComponent, data: { titleId: "myOrganization" } },
          {
            path: "two-factor",
            component: TwoFactorSetupComponent,
            data: { titleId: "twoStepLogin" },
          },
          {
            path: "billing",
            component: OrganizationBillingComponent,
            canActivate: [PermissionsGuard],
            data: { titleId: "billing", permissions: (org: Organization) => org.canManageBilling },
          },
          {
            path: "subscription",
            component: OrganizationSubscriptionComponent,
            data: { titleId: "subscription" },
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
