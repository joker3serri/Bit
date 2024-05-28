import { convertToSecretAccessPoliciesView } from "./ap-item-value.type";
import { ApItemEnum } from "./enums/ap-item.enum";
import { ApPermissionEnum } from "./enums/ap-permission.enum";

describe("convertToSecretAccessPoliciesView", () => {
  it("should convert selected policy values to SecretAccessPoliciesView", () => {
    const selectedPeoplePolicyValues = [
      {
        id: "organizationUserId",
        type: ApItemEnum.User,
        permission: ApPermissionEnum.CanReadWrite,
      },
      {
        id: "groupId",
        type: ApItemEnum.Group,
        permission: ApPermissionEnum.CanRead,
      },
    ];

    const selectedServiceAccountPolicyValues = [
      {
        id: "serviceAccountId",
        type: ApItemEnum.ServiceAccount,
        permission: ApPermissionEnum.CanReadWrite,
      },
    ];

    const result = convertToSecretAccessPoliciesView(
      selectedPeoplePolicyValues,
      selectedServiceAccountPolicyValues,
    );

    expect(result.userAccessPolicies).toHaveLength(1);
    expect(result.userAccessPolicies[0].organizationUserId).toBe("organizationUserId");
    expect(result.userAccessPolicies[0].read).toBe(true);
    expect(result.userAccessPolicies[0].write).toBe(true);

    expect(result.groupAccessPolicies).toHaveLength(1);
    expect(result.groupAccessPolicies[0].groupId).toBe("groupId");
    expect(result.groupAccessPolicies[0].read).toBe(true);
    expect(result.groupAccessPolicies[0].write).toBe(false);

    expect(result.serviceAccountAccessPolicies).toHaveLength(1);
    expect(result.serviceAccountAccessPolicies[0].serviceAccountId).toBe("serviceAccountId");
    expect(result.serviceAccountAccessPolicies[0].read).toBe(true);
    expect(result.serviceAccountAccessPolicies[0].write).toBe(true);
  });
});
