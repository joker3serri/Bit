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

    expect(result[0].type).toBe(ApItemEnum.User);
    expect(result[0].icon).toBe("bwi-user");
    expect(result[0].id).toBe("organizationUserId");
    expect(result[0].accessPolicyId).toBe("accessPolicyId");
    expect(result[0].labelName).toBe("organizationUserName");
    expect(result[0].listName).toBe("organizationUserName");
    expect(result[0].permission).toBe(ApPermissionEnum.CanReadWrite);
    expect(result[0].userId).toBe("userId");
    expect(result[0].currentUser).toBe(true);
    expect(result[0].readOnly).toBe(false);

    expect(result[1].type).toBe(ApItemEnum.Group);
    expect(result[1].icon).toBe("bwi-family");
    expect(result[1].id).toBe("groupId");
    expect(result[1].accessPolicyId).toBe("accessPolicyId");
    expect(result[1].labelName).toBe("groupName");
    expect(result[1].listName).toBe("groupName");
    expect(result[1].permission).toBe(ApPermissionEnum.CanRead);
    expect(result[1].currentUserInGroup).toBe(true);
    expect(result[1].readOnly).toBe(false);

    expect(result[2].type).toBe(ApItemEnum.ServiceAccount);
    expect(result[2].icon).toBe("bwi-wrench");
    expect(result[2].id).toBe("serviceAccountId");
    expect(result[2].accessPolicyId).toBe("accessPolicyId");
    expect(result[2].labelName).toBe("serviceAccountName");
    expect(result[2].listName).toBe("serviceAccountName");
    expect(result[2].permission).toBe(ApPermissionEnum.CanReadWrite);
    expect(result[2].readOnly).toBe(false);
  });
});
