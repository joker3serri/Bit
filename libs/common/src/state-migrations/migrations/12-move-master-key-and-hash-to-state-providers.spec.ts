import { any, MockProxy } from "jest-mock-extended";

import { MigrationHelper } from "../migration-helper";
import { mockMigrationHelper } from "../migration-helper.spec";

import { MoveMasterKeyAndHashMigrator } from "./12-move-master-key-and-hash-to-state-providers";

function preMigrationState() {
  return {
    global: {
      otherStuff: "otherStuff1",
    },
    authenticatedAccounts: ["FirstAccount", "SecondAccount", "ThirdAccount"],
    // prettier-ignore
    "FirstAccount": {
      keys: {
        masterKey: "FirstAccount_masterKey",
      },
      profile: {
        keyHash: "FirstAccount_keyHash",
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
      keys: {
        masterKey: "ThirdAccount_masterKey",
      },
      profile: {
        otherStuff: "otherStuff6",
      },
    },
  };
}

function postMigrationState() {
  return {
    user_FirstAccount_masterPassword_masterKey: "FirstAccount_masterKey",
    user_FirstAccount_masterPassword_masterKeyHash: "FirstAccount_keyHash",
    user_FirstAccount_masterPassword_forceSetPasswordReason: "FirstAccount_forceSetPasswordReason",
    user_SecondAccount_masterPassword_forceSetPasswordReason:
      "SecondAccount_forceSetPasswordReason",
    user_ThirdAccount_masterPassword_masterKey: "ThirdAccount_masterKey",
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
    // Third account removed for tests
  };
}

describe("MoveMasterKeyAndHashMigrator", () => {
  let helper: MockProxy<MigrationHelper>;
  let sut: MoveMasterKeyAndHashMigrator;

  const MASTER_KEY_DEFINITION = {
    key: "masterKey",
    stateDefinition: {
      name: "masterPassword",
    },
  };

  const MASTER_KEY_HASH_DEFINITION = {
    key: "masterKeyHash",
    stateDefinition: {
      name: "masterPassword",
    },
  };

  const FORCE_SET_PASSWORD_REASON_DEFINITION = {
    key: "forceSetPasswordReason",
    stateDefinition: {
      name: "masterPassword",
    },
  };

  describe("migrate", () => {
    beforeEach(() => {
      helper = mockMigrationHelper(preMigrationState(), 11);
      sut = new MoveMasterKeyAndHashMigrator(11, 12);
    });

    it("should remove properties from all accounts", async () => {
      await sut.migrate(helper);
      expect(helper.set).toHaveBeenCalledWith("FirstAccount", {
        keys: {},
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
        keys: {},
        profile: {
          otherStuff: "otherStuff6",
        },
      });
    });

    it("should set properties for each account", async () => {
      await sut.migrate(helper);

      expect(helper.setToUser).toHaveBeenCalledWith(
        "FirstAccount",
        MASTER_KEY_DEFINITION,
        "FirstAccount_masterKey",
      );

      expect(helper.setToUser).toHaveBeenCalledWith(
        "FirstAccount",
        MASTER_KEY_HASH_DEFINITION,
        "FirstAccount_keyHash",
      );

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

      expect(helper.setToUser).toHaveBeenCalledWith(
        "ThirdAccount",
        MASTER_KEY_DEFINITION,
        "ThirdAccount_masterKey",
      );
    });
  });

  describe("rollback", () => {
    beforeEach(() => {
      helper = mockMigrationHelper(postMigrationState(), 11);
      sut = new MoveMasterKeyAndHashMigrator(11, 12);
    });

    it.each(["FirstAccount", "SecondAccount"])("should null out new values", async (userId) => {
      await sut.rollback(helper);

      expect(helper.setToUser).toHaveBeenCalledWith(userId, MASTER_KEY_DEFINITION, null);
      expect(helper.setToUser).toHaveBeenCalledWith(userId, MASTER_KEY_HASH_DEFINITION, null);
      expect(helper.setToUser).toHaveBeenCalledWith(
        userId,
        FORCE_SET_PASSWORD_REASON_DEFINITION,
        null,
      );
    });

    it("should add explicit value back to accounts", async () => {
      await sut.rollback(helper);

      expect(helper.set).toHaveBeenCalledWith("FirstAccount", {
        keys: {
          masterKey: "FirstAccount_masterKey",
        },
        profile: {
          keyHash: "FirstAccount_keyHash",
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
