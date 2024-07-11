import { runMigrator } from "../migration-helper.spec";
import { IRREVERSIBLE } from "../migrator";

import { RemoveUnassignedItemsBannerDismissed } from "./67-remove-unassigned-items-banner-dismissed";

describe("RemoveUnassignedItemsBannerDismissed", () => {
  const sut = new RemoveUnassignedItemsBannerDismissed(66, 67);

  describe("migrate", () => {
    it("deletes unassignedItemsBanner from all users", async () => {
      const output = await runMigrator(sut, {
        authenticatedAccounts: ["user-1", "user-2"],
        "user_user-1_unassignedItemsBanner_bannerDismissed": true,
        "user_user-2_unassignedItemsBanner_bannerDismissed": false,
      });

      expect(output).toEqual({
        authenticatedAccounts: ["user-1", "user-2"],
      });
    });
  });

  describe("rollback", () => {
    it("is irreversible", async () => {
      await expect(runMigrator(sut, {}, "rollback")).rejects.toThrow(IRREVERSIBLE);
    });
  });
});
