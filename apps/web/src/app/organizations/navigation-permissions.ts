import { Organization } from "@bitwarden/common/models/domain/organization";

export function canAccessMembersTab(org: Organization): boolean {
  return org.canManageUsers || org.canManageUsersPassword;
}

export function canAccessGroupsTab(org: Organization): boolean {
  return org.canManageGroups;
}

export function canAccessReportingTab(org: Organization): boolean {
  return org.canAccessReports || org.canAccessEventLogs;
}

export function canAccessBillingTab(org: Organization): boolean {
  return org.canManageBilling;
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
  return (
    canAccessMembersTab(org) ||
    canAccessGroupsTab(org) ||
    canAccessReportingTab(org) ||
    canAccessBillingTab(org) ||
    canAccessSettingsTab(org) ||
    canAccessManageTab(org)
  );
}
