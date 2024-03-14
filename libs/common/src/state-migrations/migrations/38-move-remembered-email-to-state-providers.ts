import { KeyDefinitionLike, MigrationHelper, StateDefinitionLike } from "../migration-helper";
import { Migrator } from "../migrator";

type ExpectedGlobalState = { rememberedEmail?: string };

const LOGIN_STATE: StateDefinitionLike = { name: "login" };

const REMEMBERED_EMAIL: KeyDefinitionLike = {
  key: "rememberedEmail",
  stateDefinition: LOGIN_STATE,
};

export class RememberedEmailMigrator extends Migrator<37, 38> {
  async migrate(helper: MigrationHelper): Promise<void> {
    const legacyGlobal = await helper.get<ExpectedGlobalState>("global");

    // Move global data
    if (legacyGlobal?.rememberedEmail != null) {
      await helper.setToGlobal(REMEMBERED_EMAIL, legacyGlobal.rememberedEmail);
    }

    // Delete legacy global data
    delete legacyGlobal?.rememberedEmail;
    await helper.set("global", legacyGlobal);
  }

  async rollback(helper: MigrationHelper): Promise<void> {
    let legacyGlobal = await helper.get<ExpectedGlobalState>("global");
    let updatedLegacyGlobal = false;
    const globalRememberedEmail = await helper.getFromGlobal<string>(REMEMBERED_EMAIL);

    if (globalRememberedEmail) {
      if (!legacyGlobal) {
        legacyGlobal = {};
      }

      updatedLegacyGlobal = true;
      legacyGlobal.rememberedEmail = globalRememberedEmail;
      await helper.setToGlobal(REMEMBERED_EMAIL, null);
    }

    if (updatedLegacyGlobal) {
      await helper.set("global", legacyGlobal);
    }
  }
}
