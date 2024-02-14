import { mock } from "jest-mock-extended";

import { PolicyType } from "../../../admin-console/enums";
// FIXME: use index.ts imports once policy abstractions and models
// implement ADR-0002
import { Policy } from "../../../admin-console/models/domain/policy";
import { DefaultPolicyEvaluator } from "../default-policy-evaluator";
import { CATCHALL_SETTINGS } from "../key-definitions";

import { CatchallGeneratorStrategy, UsernameGenerationServiceAbstraction } from ".";

describe("Email subaddress list generation strategy", () => {
  describe("evaluator()", () => {
    it("should throw if the policy type is incorrect", () => {
      const strategy = new CatchallGeneratorStrategy(null);
      const policy = mock<Policy>({
        type: PolicyType.DisableSend,
      });

      expect(() => strategy.evaluator(policy)).toThrow(new RegExp("Mismatched policy type\\. .+"));
    });

    it("should map to the policy evaluator", () => {
      const strategy = new CatchallGeneratorStrategy(null);
      const policy = mock<Policy>({
        type: PolicyType.PasswordGenerator,
        data: {
          minLength: 10,
        },
      });

      const evaluator = strategy.evaluator(policy);

      expect(evaluator).toBeInstanceOf(DefaultPolicyEvaluator);
      expect(evaluator.policy).toMatchObject({});
    });
  });

  describe("disk", () => {
    it("should use password settings key", () => {
      const legacy = mock<UsernameGenerationServiceAbstraction>();
      const strategy = new CatchallGeneratorStrategy(legacy);

      expect(strategy.disk).toBe(CATCHALL_SETTINGS);
    });
  });

  describe("cache_ms", () => {
    it("should be a positive non-zero number", () => {
      const legacy = mock<UsernameGenerationServiceAbstraction>();
      const strategy = new CatchallGeneratorStrategy(legacy);

      expect(strategy.cache_ms).toBeGreaterThan(0);
    });
  });

  describe("policy", () => {
    it("should use password generator policy", () => {
      const legacy = mock<UsernameGenerationServiceAbstraction>();
      const strategy = new CatchallGeneratorStrategy(legacy);

      expect(strategy.policy).toBe(PolicyType.PasswordGenerator);
    });
  });

  describe("generate()", () => {
    it("should call the legacy service with the given options", async () => {
      const legacy = mock<UsernameGenerationServiceAbstraction>();
      const strategy = new CatchallGeneratorStrategy(legacy);
      const options = {
        type: "website-name" as const,
        domain: "example.com",
      };

      await strategy.generate(options);

      expect(legacy.generateCatchall).toHaveBeenCalledWith({
        catchallType: "website-name" as const,
        catchallDomain: "example.com",
      });
    });
  });
});
