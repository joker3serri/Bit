import { MigrationHelper } from "../migration-helper";
import { Migrator } from "../migrator";

type ExpectedGlobal = {
  installedVersion?: string;
};

export class DeleteInstalledVersion extends Migrator<50, 51> {
  async migrate(helper: MigrationHelper): Promise<void> {
    const legacyGlobal = await helper.get<ExpectedGlobal>("global");
    if (legacyGlobal?.installedVersion != null) {
      delete legacyGlobal.installedVersion;
      await helper.set("global", legacyGlobal);
    }
  }
  rollback(helper: MigrationHelper): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
