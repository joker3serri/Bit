import { MockProxy, any } from "jest-mock-extended";

import { MigrationHelper } from "../migration-helper";
import { mockMigrationHelper } from "../migration-helper.spec";

import {
  SECURITY_STAMP_MEMORY,
  SecurityStampTokenServiceStateProviderMigrator,
} from "./59-migrate-security-stamp-to-token-svc-state-provider";

// Represents data in state service pre-migration
function preMigrationJson() {
  return {
    global: {
      otherStuff: "otherStuff1",
    },
    authenticatedAccounts: ["user1", "user2", "user3"],
    user1: {
      tokens: {
        securityStamp: "user1_securityStamp",
      },
      otherStuff: "otherStuff2",
    },
    user2: {
      tokens: {
        // no security stamp
        otherStuff: "otherStuff3",
      },
      otherStuff: "otherStuff4",
    },
  };
}

function rollbackJSON() {
  return {
    // use pattern user_{userId}_{stateDefinitionName}_{keyDefinitionKey} for each user
    // User1 migrated data
    user_user1_token_securityStamp: "user1_securityStamp",

    // User2 does not have migrated data

    global: {
      otherStuff: "otherStuff1",
    },
    authenticatedAccounts: ["user1", "user2", "user3"],
    user1: {
      otherStuff: "otherStuff2",
    },
    user2: {
      tokens: {
        // no security stamp but has other data; tokens shouldn't be removed. Unlikely scenario but still handled.
        otherStuff: "otherStuff3",
      },
      otherStuff: "otherStuff4",
    },
  };
}

describe("SecurityStampTokenServiceStateProviderMigrator", () => {
  let helper: MockProxy<MigrationHelper>;
  let sut: SecurityStampTokenServiceStateProviderMigrator;

  describe("migrate", () => {
    beforeEach(() => {
      helper = mockMigrationHelper(preMigrationJson(), 58);
      sut = new SecurityStampTokenServiceStateProviderMigrator(58, 59);
    });

    it("should remove the security stamp (+ token property if it is empty) from all accounts that have it", async () => {
      await sut.migrate(helper);
      expect(helper.set).toHaveBeenCalledWith("user1", {
        otherStuff: "otherStuff2",
      });

      expect(helper.set).toHaveBeenCalledTimes(1);
      expect(helper.set).not.toHaveBeenCalledWith("user2", any());
      expect(helper.set).not.toHaveBeenCalledWith("user3", any());
    });

    it("should migrate the security stamp to state providers for accounts that have the data", async () => {
      await sut.migrate(helper);

      expect(helper.setToUser).toHaveBeenCalledWith(
        "user1",
        SECURITY_STAMP_MEMORY,
        "user1_securityStamp",
      );
      expect(helper.setToUser).toHaveBeenCalledTimes(1);

      expect(helper.setToUser).not.toHaveBeenCalledWith("user2", SECURITY_STAMP_MEMORY, any());

      expect(helper.setToUser).not.toHaveBeenCalledWith("user3", SECURITY_STAMP_MEMORY, any());
    });
  });

  describe("rollback", () => {
    beforeEach(() => {
      helper = mockMigrationHelper(rollbackJSON(), 59);
      sut = new SecurityStampTokenServiceStateProviderMigrator(58, 59);
    });

    it("should null out newly migrated entries in state provider framework", async () => {
      await sut.rollback(helper);

      expect(helper.setToUser).toHaveBeenCalledWith("user1", SECURITY_STAMP_MEMORY, null);
      expect(helper.setToUser).toHaveBeenCalledWith("user2", SECURITY_STAMP_MEMORY, null);
      expect(helper.setToUser).toHaveBeenCalledWith("user3", SECURITY_STAMP_MEMORY, null);
    });

    it("should add back the security stamp to all accounts", async () => {
      await sut.rollback(helper);

      expect(helper.set).toHaveBeenCalledWith("user1", {
        tokens: {
          securityStamp: "user1_securityStamp",
        },
        otherStuff: "otherStuff2",
      });
    });

    it("should not add data back if data wasn't migrated or acct doesn't exist", async () => {
      await sut.rollback(helper);

      // no data to add back for user2 (acct exists but no migrated data) and user3 (no acct)
      expect(helper.set).not.toHaveBeenCalledWith("user2", any());
      expect(helper.set).not.toHaveBeenCalledWith("user3", any());
    });
  });
});
