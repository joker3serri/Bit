import { SecretAccessPoliciesView } from "../../../../models/view/access-policies/secret-access-policies.view";

import { convertSecretAccessPoliciesToApItemViews } from "./ap-item-view.type";
import { ApItemEnum } from "./enums/ap-item.enum";
import { ApPermissionEnum } from "./enums/ap-permission.enum";

describe("convertSecretAccessPoliciesToApItemViews", () => {
  it("should convert secret access policies to ApItemViewType array", () => {
    const secretAccessPolicies: SecretAccessPoliciesView = {
      userAccessPolicies: [
        {
          id: "accessPolicyId",
          read: true,
          write: true,
          creationDate: "2021-01-01T00:00:00Z",
          revisionDate: "2021-01-01T00:00:00Z",
          organizationUserId: "organizationUserId",
          organizationUserName: "organizationUserName",
          userId: "userId",
          currentUser: true,
          grantedSecretId: "grantedSecretId",
        },
      ],
      groupAccessPolicies: [
        {
          id: "accessPolicyId",
          read: true,
          write: false,
          creationDate: "2021-01-01T00:00:00Z",
          revisionDate: "2021-01-01T00:00:00Z",
          groupId: "groupId",
          groupName: "groupName",
          currentUserInGroup: true,
          grantedSecretId: "grantedSecretId",
        },
      ],
      serviceAccountAccessPolicies: [
        {
          id: "accessPolicyId",
          read: true,
          write: true,
          creationDate: "2021-01-01T00:00:00Z",
          revisionDate: "2021-01-01T00:00:00Z",
          serviceAccountId: "serviceAccountId",
          serviceAccountName: "serviceAccountName",
          grantedSecretId: "grantedSecretId",
        },
      ],
    };

    const result = convertSecretAccessPoliciesToApItemViews(secretAccessPolicies);

    expect(result).toHaveLength(3);

    const userApItem = result.find((item) => item.type === ApItemEnum.User);
    expect(userApItem.type).toBe(ApItemEnum.User);
    expect(userApItem.icon).toBe("bwi-user");
    expect(userApItem.id).toBe("organizationUserId");
    expect(userApItem.accessPolicyId).toBe("accessPolicyId");
    expect(userApItem.labelName).toBe("organizationUserName");
    expect(userApItem.listName).toBe("organizationUserName");
    expect(userApItem.permission).toBe(ApPermissionEnum.CanReadWrite);
    expect(userApItem.readOnly).toBe(false);
    if (userApItem.type === ApItemEnum.User) {
      expect(userApItem.currentUser).toBe(true);
    }

    const groupApItem = result.find((item) => item.type === ApItemEnum.Group);
    expect(groupApItem.type).toBe(ApItemEnum.Group);
    expect(groupApItem.icon).toBe("bwi-family");
    expect(groupApItem.id).toBe("groupId");
    expect(groupApItem.accessPolicyId).toBe("accessPolicyId");
    expect(groupApItem.labelName).toBe("groupName");
    expect(groupApItem.listName).toBe("groupName");
    expect(groupApItem.permission).toBe(ApPermissionEnum.CanRead);
    expect(groupApItem.readOnly).toBe(false);
    if (groupApItem.type === ApItemEnum.Group) {
      expect(groupApItem.currentUserInGroup).toBe(true);
    }

    const serviceAccountApItem = result.find((item) => item.type === ApItemEnum.ServiceAccount);
    expect(serviceAccountApItem.type).toBe(ApItemEnum.ServiceAccount);
    expect(serviceAccountApItem.icon).toBe("bwi-wrench");
    expect(serviceAccountApItem.id).toBe("serviceAccountId");
    expect(serviceAccountApItem.accessPolicyId).toBe("accessPolicyId");
    expect(serviceAccountApItem.labelName).toBe("serviceAccountName");
    expect(serviceAccountApItem.listName).toBe("serviceAccountName");
    expect(serviceAccountApItem.permission).toBe(ApPermissionEnum.CanReadWrite);
    expect(serviceAccountApItem.readOnly).toBe(false);
  });
});
