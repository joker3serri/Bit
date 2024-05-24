import { BaseResponse } from "@bitwarden/common/models/response/base.response";

class BaseAccessPolicyResponse extends BaseResponse {
  id: string;
  read: boolean;
  write: boolean;
  creationDate: string;
  revisionDate: string;

  constructor(response: any) {
    super(response);
    this.id = this.getResponseProperty("Id");
    this.read = this.getResponseProperty("Read");
    this.write = this.getResponseProperty("Write");
    this.creationDate = this.getResponseProperty("CreationDate");
    this.revisionDate = this.getResponseProperty("RevisionDate");
  }
}

class BaseUserAccessPolicyResponse extends BaseAccessPolicyResponse {
  organizationUserId: string;
  organizationUserName: string;
  userId: string;
  currentUser: boolean;

  constructor(response: any) {
    super(response);
    this.organizationUserId = this.getResponseProperty("OrganizationUserId");
    this.organizationUserName = this.getResponseProperty("OrganizationUserName");
    this.userId = this.getResponseProperty("UserId");
    this.currentUser = this.getResponseProperty("CurrentUser");
  }
}

export class UserProjectAccessPolicyResponse extends BaseUserAccessPolicyResponse {
  grantedProjectId: string;

  constructor(response: any) {
    super(response);
    this.grantedProjectId = this.getResponseProperty("GrantedProjectId");
  }
}

export class UserSecretAccessPolicyResponse extends BaseUserAccessPolicyResponse {
  grantedSecretId: string;

  constructor(response: any) {
    super(response);
    this.grantedSecretId = this.getResponseProperty("GrantedSecretId");
  }
}

export class UserServiceAccountAccessPolicyResponse extends BaseUserAccessPolicyResponse {
  grantedServiceAccountId: string;

  constructor(response: any) {
    super(response);
    this.grantedServiceAccountId = this.getResponseProperty("GrantedServiceAccountId");
  }
}

class BaseGroupAccessPolicyResponse extends BaseAccessPolicyResponse {
  groupId: string;
  groupName: string;
  currentUserInGroup: boolean;

  constructor(response: any) {
    super(response);
    this.groupId = this.getResponseProperty("GroupId");
    this.groupName = this.getResponseProperty("GroupName");
    this.currentUserInGroup = this.getResponseProperty("CurrentUserInGroup");
  }
}

export class GroupProjectAccessPolicyResponse extends BaseGroupAccessPolicyResponse {
  grantedProjectId: string;

  constructor(response: any) {
    super(response);
    this.grantedProjectId = this.getResponseProperty("GrantedProjectId");
  }
}

export class GroupSecretAccessPolicyResponse extends BaseGroupAccessPolicyResponse {
  grantedSecretId: string;

  constructor(response: any) {
    super(response);
    this.grantedSecretId = this.getResponseProperty("GrantedSecretId");
  }
}

export class GroupServiceAccountAccessPolicyResponse extends BaseGroupAccessPolicyResponse {
  grantedServiceAccountId: string;

  constructor(response: any) {
    super(response);
    this.grantedServiceAccountId = this.getResponseProperty("GrantedServiceAccountId");
  }
}

class BaseServiceAccountAccessPolicyResponse extends BaseAccessPolicyResponse {
  serviceAccountId: string;
  serviceAccountName: string;

  constructor(response: any) {
    super(response);
    this.serviceAccountId = this.getResponseProperty("ServiceAccountId");
    this.serviceAccountName = this.getResponseProperty("ServiceAccountName");
  }
}

export class ServiceAccountProjectAccessPolicyResponse extends BaseServiceAccountAccessPolicyResponse {
  grantedProjectId: string;
  grantedProjectName: string;

  constructor(response: any) {
    super(response);
    this.grantedProjectId = this.getResponseProperty("GrantedProjectId");
    this.grantedProjectName = this.getResponseProperty("GrantedProjectName");
  }
}

export class ServiceAccountSecretAccessPolicyResponse extends BaseServiceAccountAccessPolicyResponse {
  grantedSecretId: string;

  constructor(response: any) {
    super(response);
    this.grantedSecretId = this.getResponseProperty("GrantedSecretId");
  }
}
