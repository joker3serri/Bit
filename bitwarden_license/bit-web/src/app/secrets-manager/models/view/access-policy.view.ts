import { View } from "@bitwarden/common/models/view/view";

export class BaseAccessPolicyView implements View {
  id: string;
  read: boolean;
  write: boolean;
  creationDate: string;
  revisionDate: string;
}

export class UserProjectAccessPolicyView extends BaseAccessPolicyView {
  organizationUserId: string;
  organizationUserName: string;
  grantedProjectId: string;
}

export class GroupProjectAccessPolicyView extends BaseAccessPolicyView {
  groupId: string;
  groupName: string;
  grantedProjectId: string;
}

export class ServiceAccountProjectAccessPolicyView extends BaseAccessPolicyView {
  serviceAccountId: string;
  serviceAccountName: string;
  grantedProjectId: string;
}
