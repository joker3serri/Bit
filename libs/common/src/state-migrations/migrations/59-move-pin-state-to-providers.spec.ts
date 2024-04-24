import { MockProxy } from "jest-mock-extended";

import { MigrationHelper } from "../migration-helper";
import { mockMigrationHelper } from "../migration-helper.spec";

import {
  OLD_PIN_KEY_ENCRYPTED_MASTER_KEY,
  PIN_KEY_ENCRYPTED_USER_KEY,
  PROTECTED_PIN,
  PinStateMigrator,
} from "./59-move-pin-state-to-providers";

function preMigrationState() {
  return {
    global: {
      otherStuff: "otherStuff1",
    },
    authenticatedAccounts: ["AccountOne", "AccountTwo"],
    // prettier-ignore
    "AccountOne": {
      settings: {
        pinKeyEncryptedUserKey: "AccountOne_pinKeyEncryptedUserKey",
        protectedPin: "AccountOne_protectedPin",
        pinProtected: {
          encrypted: "AccountOne_oldPinKeyEncryptedMasterKey", // note the name change
        },
        otherStuff: "otherStuff2",
      },
      otherStuff: "otherStuff3",
    },
    // prettier-ignore
    "AccountTwo": {
      settings: {
        otherStuff: "otherStuff4",
      },
    },
  };
}

function postMigrationState() {
  return {
    user_AccountOne_pinUnlock_pinKeyEncryptedUserKey: "AccountOne_pinKeyEncryptedUserKey",
    user_AccountOne_pinUnlock_protectedPin: "AccountOne_protectedPin",
    user_AccountOne_pinUnlock_oldPinKeyEncryptedMasterKey: "AccountOne_oldPinKeyEncryptedMasterKey",
    authenticatedAccounts: ["AccountOne", "AccountTwo"],
    global: {
      otherStuff: "otherStuff1",
    },
    // prettier-ignore
    "AccountOne": {
      settings: {
        otherStuff: "otherStuff2",
      },
      otherStuff: "otherStuff3",
    },
    // prettier-ignore
    "AccountTwo": {
      settings: {
        otherStuff: "otherStuff4",
      },
    },
  };
}

describe("PinStateMigrator", () => {
  let helper: MockProxy<MigrationHelper>;
  let sut: PinStateMigrator;

  describe("migrate", () => {
    beforeEach(() => {
      helper = mockMigrationHelper(preMigrationState(), 58);
      sut = new PinStateMigrator(58, 59);
    });

    it("should remove properties (pinKeyEncryptedUserKey, protectedPin, pinProtected) from existing accounts", async () => {
      await sut.migrate(helper);

      expect(helper.set).toHaveBeenCalledWith("AccountOne", {
        settings: {
          otherStuff: "otherStuff2",
        },
        otherStuff: "otherStuff3",
      });

      expect(helper.set).not.toHaveBeenCalledWith("AccountTwo");
    });

    it("should set the properties (pinKeyEncryptedUserKey, protectedPin, oldPinKeyEncryptedMasterKey) under the new key definitions", async () => {
      await sut.migrate(helper);

      expect(helper.setToUser).toHaveBeenCalledWith(
        "AccountOne",
        PIN_KEY_ENCRYPTED_USER_KEY,
        "AccountOne_pinKeyEncryptedUserKey",
      );

      expect(helper.setToUser).toHaveBeenCalledWith(
        "AccountOne",
        PROTECTED_PIN,
        "AccountOne_protectedPin",
      );

      expect(helper.setToUser).toHaveBeenCalledWith(
        "AccountOne",
        OLD_PIN_KEY_ENCRYPTED_MASTER_KEY,
        "AccountOne_oldPinKeyEncryptedMasterKey",
      );

      expect(helper.setToUser).not.toHaveBeenCalledWith("AccountTwo");
    });
  });

  describe("rollback", () => {
    beforeEach(() => {
      helper = mockMigrationHelper(postMigrationState(), 59);
      sut = new PinStateMigrator(58, 59);
    });

    it("should null out the previously migrated values (pinKeyEncryptedUserKey, protectedPin, oldPinKeyEncryptedMasterKey)", async () => {
      await sut.rollback(helper);

      expect(helper.setToUser).toHaveBeenCalledWith("AccountOne", PIN_KEY_ENCRYPTED_USER_KEY, null);
      expect(helper.setToUser).toHaveBeenCalledWith("AccountOne", PROTECTED_PIN, null);
      expect(helper.setToUser).toHaveBeenCalledWith(
        "AccountOne",
        OLD_PIN_KEY_ENCRYPTED_MASTER_KEY,
        null,
      );
    });

    it("should set back the original account properties (pinKeyEncryptedUserKey, protectedPin, pinProtected)", async () => {
      await sut.rollback(helper);

      expect(helper.set).toHaveBeenCalledTimes(1);
      expect(helper.set).toHaveBeenCalledWith("AccountOne", {
        settings: {
          pinKeyEncryptedUserKey: "AccountOne_pinKeyEncryptedUserKey",
          protectedPin: "AccountOne_protectedPin",
          pinProtected: {
            encrypted: "AccountOne_oldPinKeyEncryptedMasterKey", // note the name change
          },
          otherStuff: "otherStuff2",
        },
        otherStuff: "otherStuff3",
      });
    });
  });
});
