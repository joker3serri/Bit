import { KeyDefinitionLike, MigrationHelper } from "../migration-helper";
import { Migrator } from "../migrator";

type ExpectedGlobal = { theme?: string };

const THEME_SELECTION: KeyDefinitionLike = {
  key: "selection",
  stateDefinition: { name: "theming" },
};

export class MoveThemeToStateProviderMigrator extends Migrator<23, 24> {
  async migrate(helper: MigrationHelper): Promise<void> {
    const legacyGlobalState = await helper.get<ExpectedGlobal>("global");
    const theme = legacyGlobalState?.theme;
    if (theme) {
      await helper.setToGlobal(THEME_SELECTION, theme);
      delete legacyGlobalState.theme;
      await helper.set("global", legacyGlobalState);
    }
  }

  rollback(helper: MigrationHelper): Promise<void> {
    throw new Error("Method not implemented.");
  }
}
