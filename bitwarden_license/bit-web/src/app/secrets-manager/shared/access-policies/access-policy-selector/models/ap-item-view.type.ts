import { Utils } from "@bitwarden/common/platform/misc/utils";
import { SelectItemView } from "@bitwarden/components";

import {
  GroupProjectAccessPolicyView,
  GroupSecretAccessPolicyView,
  GroupServiceAccountAccessPolicyView,
  ServiceAccountProjectAccessPolicyView,
  ServiceAccountSecretAccessPolicyView,
  UserProjectAccessPolicyView,
  UserSecretAccessPolicyView,
  UserServiceAccountAccessPolicyView,
} from "../../../../models/view/access-policies/access-policy.view";
import { PotentialGranteeView } from "../../../../models/view/access-policies/potential-grantee.view";
import { ProjectPeopleAccessPoliciesView } from "../../../../models/view/access-policies/project-people-access-policies.view";
import { ProjectServiceAccountsAccessPoliciesView } from "../../../../models/view/access-policies/project-service-accounts-access-policies.view";
import { SecretAccessPoliciesView } from "../../../../models/view/access-policies/secret-access-policies.view";
import { ServiceAccountGrantedPoliciesView } from "../../../../models/view/access-policies/service-account-granted-policies.view";
import { ServiceAccountPeopleAccessPoliciesView } from "../../../../models/view/access-policies/service-account-people-access-policies.view";

import { ApItemEnum, ApItemEnumUtil } from "./enums/ap-item.enum";
import { ApPermissionEnum, ApPermissionEnumUtil } from "./enums/ap-permission.enum";

export type ApItemViewType = SelectItemView & {
  accessPolicyId?: string;
  permission?: ApPermissionEnum;
  /**
   * Flag that this item cannot be modified.
   * This will disable the permission editor and will keep
   * the item always selected.
   */
  readOnly: boolean;
} & (
    | {
        type: ApItemEnum.User;
        userId?: string;
        currentUser?: boolean;
      }
    | {
        type: ApItemEnum.Group;
        currentUserInGroup?: boolean;
      }
    | {
        type: ApItemEnum.ServiceAccount;
      }
    | {
        type: ApItemEnum.Project;
      }
  );

export function convertToAccessPolicyItemViews(
  value: ProjectPeopleAccessPoliciesView | ServiceAccountPeopleAccessPoliciesView,
): ApItemViewType[] {
  const accessPolicies: ApItemViewType[] = [];

  value.userAccessPolicies.forEach((policy) => {
    accessPolicies.push(toUserApItemView(policy));
  });

  value.groupAccessPolicies.forEach((policy) => {
    accessPolicies.push(toGroupApItemView(policy));
  });

  return accessPolicies;
}

export function convertGrantedPoliciesToAccessPolicyItemViews(
  value: ServiceAccountGrantedPoliciesView,
): ApItemViewType[] {
  const accessPolicies: ApItemViewType[] = [];

  value.grantedProjectPolicies.forEach((detailView) => {
    accessPolicies.push({
      type: ApItemEnum.Project,
      icon: ApItemEnumUtil.itemIcon(ApItemEnum.Project),
      id: detailView.accessPolicy.grantedProjectId,
      accessPolicyId: detailView.accessPolicy.id,
      labelName: detailView.accessPolicy.grantedProjectName,
      listName: detailView.accessPolicy.grantedProjectName,
      permission: ApPermissionEnumUtil.toApPermissionEnum(
        detailView.accessPolicy.read,
        detailView.accessPolicy.write,
      ),
      readOnly: !detailView.hasPermission,
    });
  });
  return accessPolicies;
}

export function convertProjectServiceAccountsViewToApItemViews(
  value: ProjectServiceAccountsAccessPoliciesView,
): ApItemViewType[] {
  const accessPolicies: ApItemViewType[] = [];

  value.serviceAccountAccessPolicies.forEach((policy) => {
    accessPolicies.push(toServiceAccountApItemView(policy));
  });
  return accessPolicies;
}

export function convertSecretAccessPoliciesToApItemViews(
  value: SecretAccessPoliciesView,
): ApItemViewType[] {
  const accessPolicies: ApItemViewType[] = [];

  value.userAccessPolicies.forEach((policy) => {
    accessPolicies.push(toUserApItemView(policy));
  });

  value.groupAccessPolicies.forEach((policy) => {
    accessPolicies.push(toGroupApItemView(policy));
  });

  value.serviceAccountAccessPolicies.forEach((policy) => {
    accessPolicies.push(toServiceAccountApItemView(policy));
  });
  return accessPolicies;
}

export function convertPotentialGranteesToApItemViewType(
  grantees: PotentialGranteeView[],
): ApItemViewType[] {
  return grantees.map((granteeView) => {
    let icon: string;
    let type: ApItemEnum;
    let listName = granteeView.name;
    let labelName = granteeView.name;

    switch (granteeView.type) {
      case "user":
        icon = ApItemEnumUtil.itemIcon(ApItemEnum.User);
        type = ApItemEnum.User;
        if (Utils.isNullOrWhitespace(granteeView.name)) {
          listName = granteeView.email;
          labelName = granteeView.email;
        } else {
          listName = `${granteeView.name} (${granteeView.email})`;
        }
        break;
      case "group":
        icon = ApItemEnumUtil.itemIcon(ApItemEnum.Group);
        type = ApItemEnum.Group;
        break;
      case "serviceAccount":
        icon = ApItemEnumUtil.itemIcon(ApItemEnum.ServiceAccount);
        type = ApItemEnum.ServiceAccount;
        break;
      case "project":
        icon = ApItemEnumUtil.itemIcon(ApItemEnum.Project);
        type = ApItemEnum.Project;
        break;
    }

    return {
      icon: icon,
      type: type,
      id: granteeView.id,
      labelName: labelName,
      listName: listName,
      currentUserInGroup: granteeView.currentUserInGroup,
      currentUser: granteeView.currentUser,
      readOnly: false,
    };
  });
}

function toUserApItemView(
  policy:
    | UserSecretAccessPolicyView
    | UserProjectAccessPolicyView
    | UserServiceAccountAccessPolicyView,
): ApItemViewType {
  return {
    type: ApItemEnum.User,
    icon: ApItemEnumUtil.itemIcon(ApItemEnum.User),
    id: policy.organizationUserId,
    accessPolicyId: policy.id,
    labelName: policy.organizationUserName,
    listName: policy.organizationUserName,
    permission: ApPermissionEnumUtil.toApPermissionEnum(policy.read, policy.write),
    userId: policy.userId,
    currentUser: policy.currentUser,
    readOnly: false,
  };
}

function toGroupApItemView(
  policy:
    | GroupSecretAccessPolicyView
    | GroupProjectAccessPolicyView
    | GroupServiceAccountAccessPolicyView,
): ApItemViewType {
  return {
    type: ApItemEnum.Group,
    icon: ApItemEnumUtil.itemIcon(ApItemEnum.Group),
    id: policy.groupId,
    accessPolicyId: policy.id,
    labelName: policy.groupName,
    listName: policy.groupName,
    permission: ApPermissionEnumUtil.toApPermissionEnum(policy.read, policy.write),
    currentUserInGroup: policy.currentUserInGroup,
    readOnly: false,
  };
}

function toServiceAccountApItemView(
  policy: ServiceAccountSecretAccessPolicyView | ServiceAccountProjectAccessPolicyView,
): ApItemViewType {
  return {
    type: ApItemEnum.ServiceAccount,
    icon: ApItemEnumUtil.itemIcon(ApItemEnum.ServiceAccount),
    id: policy.serviceAccountId,
    accessPolicyId: policy.id,
    labelName: policy.serviceAccountName,
    listName: policy.serviceAccountName,
    permission: ApPermissionEnumUtil.toApPermissionEnum(policy.read, policy.write),
    readOnly: false,
  };
}
