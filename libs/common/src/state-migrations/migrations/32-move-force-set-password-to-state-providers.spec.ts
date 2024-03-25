import { any, MockProxy } from "jest-mock-extended";

import { MigrationHelper } from "../migration-helper";
import { mockMigrationHelper } from "../migration-helper.spec";

import {
  FORCE_SET_PASSWORD_REASON_DEFINITION,
  MASTER_KEY_HASH_DEFINITION,
  MoveKeyHashAndForceSetPasswordReasonToStateProviderMigrator,
} from "./32-move-force-set-password-to-state-providers";

function preMigrationState() {
  return {
    global: {
      otherStuff: "otherStuff1",
    },
    authenticatedAccounts: ["FirstAccount", "SecondAccount", "ThirdAccount"],
    // prettier-ignore
    "FirstAccount": {
      profile: {
        forceSetPasswordReason: "FirstAccount_forceSetPasswordReason",
        keyHash: "FirstAccount_keyHash",
        otherStuff: "overStuff2",
      },
      otherStuff: "otherStuff3",
    },
    // prettier-ignore
    "SecondAccount": {
      profile: {
        forceSetPasswordReason: "SecondAccount_forceSetPasswordReason",
        keyHash: "SecondAccount_keyHash",
        otherStuff: "otherStuff4",
      },
      otherStuff: "otherStuff5",
    },
    // prettier-ignore
    "ThirdAccount": {
      profile: {
        otherStuff: "otherStuff6",
      },
    },
  };
}

function postMigrationState() {
  return {
    user_FirstAccount_masterPassword_forceSetPasswordReason: "FirstAccount_forceSetPasswordReason",
    user_FirstAccount_masterPassword_masterKeyHash: "FirstAccount_keyHash",
    user_SecondAccount_masterPassword_forceSetPasswordReason:
      "SecondAccount_forceSetPasswordReason",
    user_SecondAccount_masterPassword_masterKeyHash: "SecondAccount_keyHash",
    global: {
      otherStuff: "otherStuff1",
    },
    authenticatedAccounts: ["FirstAccount", "SecondAccount"],
    // prettier-ignore
    "FirstAccount": {
      profile: {
        otherStuff: "overStuff2",
      },
      otherStuff: "otherStuff3",
    },
    // prettier-ignore
    "SecondAccount": {
      profile: {
        otherStuff: "otherStuff4",
      },
      otherStuff: "otherStuff5",
    },
    // prettier-ignore
    "ThirdAccount": {
      profile: {
        otherStuff: "otherStuff6",
      },
  },
  };
}

describe("MoveForceSetPasswordReasonToStateProviderMigrator", () => {
  let helper: MockProxy<MigrationHelper>;
  let sut: MoveKeyHashAndForceSetPasswordReasonToStateProviderMigrator;

  describe("migrate", () => {
    beforeEach(() => {
      helper = mockMigrationHelper(preMigrationState(), 31);
      sut = new MoveKeyHashAndForceSetPasswordReasonToStateProviderMigrator(31, 32);
    });

    it("should remove properties from existing accounts", async () => {
      await sut.migrate(helper);
      expect(helper.set).toHaveBeenCalledWith("FirstAccount", {
        profile: {
          otherStuff: "overStuff2",
        },
        otherStuff: "otherStuff3",
      });
      expect(helper.set).toHaveBeenCalledWith("SecondAccount", {
        profile: {
          otherStuff: "otherStuff4",
        },
        otherStuff: "otherStuff5",
      });
    });

    it("should set properties for each account", async () => {
      await sut.migrate(helper);

      expect(helper.setToUser).toHaveBeenCalledWith(
        "FirstAccount",
        FORCE_SET_PASSWORD_REASON_DEFINITION,
        "FirstAccount_forceSetPasswordReason",
      );

      expect(helper.setToUser).toHaveBeenCalledWith(
        "FirstAccount",
        MASTER_KEY_HASH_DEFINITION,
        "FirstAccount_keyHash",
      );

      expect(helper.setToUser).toHaveBeenCalledWith(
        "SecondAccount",
        FORCE_SET_PASSWORD_REASON_DEFINITION,
        "SecondAccount_forceSetPasswordReason",
      );

      expect(helper.setToUser).toHaveBeenCalledWith(
        "SecondAccount",
        MASTER_KEY_HASH_DEFINITION,
        "SecondAccount_keyHash",
      );
    });
  });

  describe("rollback", () => {
    beforeEach(() => {
      helper = mockMigrationHelper(postMigrationState(), 31);
      sut = new MoveKeyHashAndForceSetPasswordReasonToStateProviderMigrator(31, 32);
    });

    it.each(["FirstAccount", "SecondAccount"])("should null out new values", async (userId) => {
      await sut.rollback(helper);

      expect(helper.setToUser).toHaveBeenCalledWith(
        userId,
        FORCE_SET_PASSWORD_REASON_DEFINITION,
        null,
      );

      expect(helper.setToUser).toHaveBeenCalledWith(userId, MASTER_KEY_HASH_DEFINITION, null);
    });

    it("should add explicit value back to accounts", async () => {
      await sut.rollback(helper);

      expect(helper.set).toHaveBeenCalledWith("FirstAccount", {
        profile: {
          forceSetPasswordReason: "FirstAccount_forceSetPasswordReason",
          keyHash: "FirstAccount_keyHash",
          otherStuff: "overStuff2",
        },
        otherStuff: "otherStuff3",
      });
      expect(helper.set).toHaveBeenCalledWith("SecondAccount", {
        profile: {
          forceSetPasswordReason: "SecondAccount_forceSetPasswordReason",
          keyHash: "SecondAccount_keyHash",
          otherStuff: "otherStuff4",
        },
        otherStuff: "otherStuff5",
      });
    });

    it("should not try to restore values to missing accounts", async () => {
      await sut.rollback(helper);

      expect(helper.set).not.toHaveBeenCalledWith("ThirdAccount", any());
    });
  });
});
