import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization.service";
import { PolicyType } from "@bitwarden/common/enums/policyType";
import { PolicyData } from "@bitwarden/common/models/data/policyData";
import { MasterPasswordPolicyOptions } from "@bitwarden/common/models/domain/masterPasswordPolicyOptions";
import { Policy } from "@bitwarden/common/models/domain/policy";
import { ResetPasswordPolicyOptions } from "@bitwarden/common/models/domain/resetPasswordPolicyOptions";
import { ContainerService } from "@bitwarden/common/services/container.service";
import { PolicyService } from "@bitwarden/common/services/policy/policy.service";
import { StateService } from "@bitwarden/common/services/state.service";

describe("Policy Service", () => {
  let policyService: PolicyService;

  let cryptoService: SubstituteOf<CryptoService>;
  let stateService: SubstituteOf<StateService>;
  let organizationService: SubstituteOf<OrganizationService>;
  let activeAccount: BehaviorSubject<string>;
  let activeAccountUnlocked: BehaviorSubject<boolean>;

  beforeEach(() => {
    stateService = Substitute.for();
    organizationService = Substitute.for();
    activeAccount = new BehaviorSubject("123");
    activeAccountUnlocked = new BehaviorSubject(true);
    stateService.getEncryptedPolicies().resolves({
      "1": policyData("1", "test-organization", PolicyType.MasterPassword, true, { minLength: 14 }),
    });
    stateService.activeAccount.returns(activeAccount);
    stateService.activeAccountUnlocked.returns(activeAccountUnlocked);
    (window as any).bitwardenContainerService = new ContainerService(cryptoService);

    policyService = new PolicyService(stateService, organizationService);
  });

  it("replace", async () => {
    await policyService.replace({
      "2": policyData("2", "test-organization", PolicyType.DisableSend, true),
    });

    expect(await firstValueFrom(policyService.policies$)).toEqual([
      {
        id: "2",
        organizationId: "test-organization",
        type: PolicyType.DisableSend,
        enabled: true,
      },
    ]);
  });

  it("clearCache", async () => {
    await policyService.clearCache();

    expect((await firstValueFrom(policyService.policies$)).length).toBe(0);
  });

  it("locking should clear", async () => {
    activeAccountUnlocked.next(false);
    // Sleep for 100ms to avoid timing issues
    await new Promise((r) => setTimeout(r, 100));

    expect((await firstValueFrom(policyService.policies$)).length).toBe(0);
  });

  describe("clear", () => {
    it("null userId", async () => {
      await policyService.clear();

      stateService.received(1).setEncryptedPolicies(Arg.any(), Arg.any());

      expect((await firstValueFrom(policyService.policies$)).length).toBe(0);
    });

    it("matching userId", async () => {
      stateService.getUserId().resolves("1");
      await policyService.clear("1");

      stateService.received(1).setEncryptedPolicies(Arg.any(), Arg.any());

      expect((await firstValueFrom(policyService.policies$)).length).toBe(0);
    });

    it("missmatching userId", async () => {
      await policyService.clear("12");

      stateService.received(1).setEncryptedPolicies(Arg.any(), Arg.any());

      expect((await firstValueFrom(policyService.policies$)).length).toBe(1);
    });
  });

  describe("getMasterPasswordPolicyOptions", () => {
    it("returns default policy options", async () => {
      const model = await policyService.getAll();
      const result = await policyService.getMasterPasswordPolicyOptions(model);

      expect(result).toEqual({
        minComplexity: 0,
        minLength: 14,
        requireLower: false,
        requireNumbers: false,
        requireSpecial: false,
        requireUpper: false,
      });
    });

    it("returns null", async () => {
      const data: any = {};
      const model = [
        new Policy(
          policyData("3", "test-organization-3", PolicyType.DisablePersonalVaultExport, true, data)
        ),
        new Policy(
          policyData("4", "test-organization-3", PolicyType.MaximumVaultTimeout, true, data)
        ),
      ];

      const result = await policyService.getMasterPasswordPolicyOptions(model);

      expect(result).toEqual(null);
    });

    it("returns specified policy options", async () => {
      const data: any = {
        minLength: 14,
      };
      const model = [
        new Policy(
          policyData("3", "test-organization-3", PolicyType.DisablePersonalVaultExport, true, data)
        ),
        new Policy(policyData("4", "test-organization-3", PolicyType.MasterPassword, true, data)),
      ];

      const result = await policyService.getMasterPasswordPolicyOptions(model);

      expect(result).toEqual({
        minComplexity: 0,
        minLength: 14,
        requireLower: false,
        requireNumbers: false,
        requireSpecial: false,
        requireUpper: false,
      });
    });
  });

  describe("evaluateMasterPassword", () => {
    it("false", async () => {
      const enforcedPolicyOptions = new MasterPasswordPolicyOptions();
      enforcedPolicyOptions.minLength = 14;
      const result = policyService.evaluateMasterPassword(10, "password", enforcedPolicyOptions);

      expect(result).toEqual(false);
    });

    it("true", async () => {
      const enforcedPolicyOptions = new MasterPasswordPolicyOptions();
      const result = policyService.evaluateMasterPassword(0, "password", enforcedPolicyOptions);

      expect(result).toEqual(true);
    });
  });

  describe("getResetPasswordPolicyOptions", () => {
    it("default", async () => {
      const result = policyService.getResetPasswordPolicyOptions(null, null);

      expect(result).toEqual([new ResetPasswordPolicyOptions(), false]);
    });

    it("returns autoEnrollEnabled true", async () => {
      const data: any = {
        autoEnrollEnabled: true,
      };
      const policies = [
        new Policy(policyData("5", "test-organization-3", PolicyType.ResetPassword, true, data)),
      ];
      const result = policyService.getResetPasswordPolicyOptions(policies, "test-organization-3");

      expect(result).toEqual([{ autoEnrollEnabled: true }, true]);
    });
  });

  function policyData(
    id: string,
    organizationId: string,
    type: PolicyType,
    enabled: boolean,
    data?: any
  ) {
    const policyData = new PolicyData({} as any);
    policyData.id = id;
    policyData.organizationId = organizationId;
    policyData.type = type;
    policyData.enabled = enabled;
    policyData.data = data;

    return policyData;
  }
});
