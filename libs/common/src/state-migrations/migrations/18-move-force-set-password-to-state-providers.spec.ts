import { any, MockProxy } from "jest-mock-extended";

import { MigrationHelper } from "../migration-helper";
import { mockMigrationHelper } from "../migration-helper.spec";

import {
  FORCE_SET_PASSWORD_REASON_DEFINITION,
  MoveForceSetPasswordReasonToStateProviderMigrator,
} from "./18-move-force-set-password-to-state-providers";

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
        otherStuff: "overStuff2",
      },
      otherStuff: "otherStuff3",
    },
    // prettier-ignore
    "SecondAccount": {
      profile: {
        forceSetPasswordReason: "SecondAccount_forceSetPasswordReason",
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
    user_SecondAccount_masterPassword_forceSetPasswordReason:
      "SecondAccount_forceSetPasswordReason",
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
  let sut: MoveForceSetPasswordReasonToStateProviderMigrator;

  describe("migrate", () => {
    beforeEach(() => {
      helper = mockMigrationHelper(preMigrationState(), 11);
      sut = new MoveForceSetPasswordReasonToStateProviderMigrator(17, 18);
    });

    it("should remove properties from all accounts", async () => {
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
      expect(helper.set).toHaveBeenCalledWith("ThirdAccount", {
        profile: {
          otherStuff: "otherStuff6",
        },
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
        "SecondAccount",
        FORCE_SET_PASSWORD_REASON_DEFINITION,
        "SecondAccount_forceSetPasswordReason",
      );
    });
  });

  describe("rollback", () => {
    beforeEach(() => {
      helper = mockMigrationHelper(postMigrationState(), 17);
      sut = new MoveForceSetPasswordReasonToStateProviderMigrator(17, 18);
    });

    it.each(["FirstAccount", "SecondAccount"])("should null out new values", async (userId) => {
      await sut.rollback(helper);

      expect(helper.setToUser).toHaveBeenCalledWith(
        userId,
        FORCE_SET_PASSWORD_REASON_DEFINITION,
        null,
      );
    });

    it("should add explicit value back to accounts", async () => {
      await sut.rollback(helper);

      expect(helper.set).toHaveBeenCalledWith("FirstAccount", {
        profile: {
          forceSetPasswordReason: "FirstAccount_forceSetPasswordReason",
          otherStuff: "overStuff2",
        },
        otherStuff: "otherStuff3",
      });
      expect(helper.set).toHaveBeenCalledWith("SecondAccount", {
        profile: {
          forceSetPasswordReason: "SecondAccount_forceSetPasswordReason",
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
