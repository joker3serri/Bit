class BaseAccessPolicyView {
  id: string;
  read: boolean;
  write: boolean;
  creationDate: string;
  revisionDate: string;
}

class BaseUserAccessPolicyView extends BaseAccessPolicyView {
  organizationUserId: string;
  organizationUserName: string;
  userId: string;
  currentUser: boolean;
}

export class UserProjectAccessPolicyView extends BaseUserAccessPolicyView {
  grantedProjectId: string;
}

export class UserSecretAccessPolicyView extends BaseUserAccessPolicyView {
  grantedSecretId: string;
}

export class UserServiceAccountAccessPolicyView extends BaseUserAccessPolicyView {
  grantedServiceAccountId: string;
}

class BaseGroupAccessPolicyView extends BaseAccessPolicyView {
  groupId: string;
  groupName: string;
  currentUserInGroup: boolean;
}

export class GroupProjectAccessPolicyView extends BaseGroupAccessPolicyView {
  grantedProjectId: string;
}

export class GroupSecretAccessPolicyView extends BaseGroupAccessPolicyView {
  grantedSecretId: string;
}

export class GroupServiceAccountAccessPolicyView extends BaseGroupAccessPolicyView {
  grantedServiceAccountId: string;
}

class BaseServiceAccountAccessPolicyView extends BaseAccessPolicyView {
  serviceAccountId: string;
  serviceAccountName: string;
}

export class ServiceAccountProjectAccessPolicyView extends BaseServiceAccountAccessPolicyView {
  grantedProjectId: string;
  grantedProjectName: string;
}

export class ServiceAccountSecretAccessPolicyView extends BaseServiceAccountAccessPolicyView {
  grantedSecretId: string;
}
