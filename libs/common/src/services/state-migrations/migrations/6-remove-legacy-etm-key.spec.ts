import { MockProxy } from "jest-mock-extended";

import { MigrationHelper } from "../migration-helper";
import { mockMigrationHelper } from "../migration-helper.spec";

import { RemoveLegacyEtmKeyMigrator } from "./6-remove-legacy-etm-key";

const exampleJSON = {
  authenticatedAccounts: [
    "c493ed01-4e08-4e88-abc7-332f380ca760",
    "23e61a5f-2ece-4f5e-b499-f0bc489482a9",
    "fd005ea6-a16a-45ef-ba4a-a194269bfd73",
  ],
  "c493ed01-4e08-4e88-abc7-332f380ca760": {
    keys: {
      legacyEtmKey: "legacyEtmKey",
      otherStuff: "otherStuff",
    },
    otherStuff: "otherStuff",
  },
  "23e61a5f-2ece-4f5e-b499-f0bc489482a9": {
    keys: {
      legacyEtmKey: "legacyEtmKey",
      otherStuff: "otherStuff",
    },
    otherStuff: "otherStuff",
  },
};

describe("RemoveLegacyEtmKeyMigrator", () => {
  let helper: MockProxy<MigrationHelper>;
  let sut: RemoveLegacyEtmKeyMigrator;

  beforeEach(() => {
    helper = mockMigrationHelper(exampleJSON);
    sut = new RemoveLegacyEtmKeyMigrator(5, 6);
  });

  describe("migrate", () => {
    it("should remove legacyEtmKey from all accounts", async () => {
      await sut.migrate(helper);
      expect(helper.set).toHaveBeenCalledWith("c493ed01-4e08-4e88-abc7-332f380ca760", {
        keys: {
          otherStuff: "otherStuff",
        },
        otherStuff: "otherStuff",
      });
      expect(helper.set).toHaveBeenCalledWith("23e61a5f-2ece-4f5e-b499-f0bc489482a9", {
        keys: {
          otherStuff: "otherStuff",
        },
        otherStuff: "otherStuff",
      });
    });
  });

  describe("rollback", () => {
    it("should throw", async () => {
      await expect(sut.rollback(helper)).rejects.toThrow();
    });
  });
});
