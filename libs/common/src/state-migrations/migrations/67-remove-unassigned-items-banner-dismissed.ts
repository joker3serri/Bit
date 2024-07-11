import { KeyDefinitionLike, MigrationHelper } from "../migration-helper";
import { IRREVERSIBLE, Migrator } from "../migrator";

export const BANNER_DISMISSED: KeyDefinitionLike = {
  key: "bannerDismissed",
  stateDefinition: { name: "unassignedItemsBanner" },
};

export class RemoveUnassignedItemsBannerDismissed extends Migrator<66, 67> {
  async migrate(helper: MigrationHelper): Promise<void> {
    await Promise.all(
      (await helper.getAccounts()).map(async ({ userId }) => {
        if (helper.getFromUser(userId, BANNER_DISMISSED) != null) {
          await helper.removeFromUser(userId, BANNER_DISMISSED);
        }
      }),
    );
  }

  async rollback(helper: MigrationHelper): Promise<void> {
    throw IRREVERSIBLE;
  }
}
