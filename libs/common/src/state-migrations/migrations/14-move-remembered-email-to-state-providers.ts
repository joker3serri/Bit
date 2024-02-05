import { KeyDefinitionLike, MigrationHelper, StateDefinitionLike } from "../migration-helper";
import { Migrator } from "../migrator";

type ExpectedGlobalState = {
  rememberedEmail: string;
};

const LOGIN_STATE: StateDefinitionLike = {
  name: "login",
};

const REMEMBERED_EMAIL: KeyDefinitionLike = {
  key: "rememberedEmail",
  stateDefinition: LOGIN_STATE,
};

export class RememberedEmailMigrator extends Migrator<13, 14> {
  async migrate(helper: MigrationHelper): Promise<void> {
    const legacyGlobal = await helper.get<ExpectedGlobalState>("global");

    if (legacyGlobal?.rememberedEmail != null) {
      await helper.setToGlobal(REMEMBERED_EMAIL, legacyGlobal.rememberedEmail);
    }

    delete legacyGlobal.rememberedEmail;
    await helper.set("global", legacyGlobal);
  }

  async rollback(helper: MigrationHelper): Promise<void> {
    // TODO: implement method
  }
}
