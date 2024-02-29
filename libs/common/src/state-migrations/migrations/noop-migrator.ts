import { Constructor } from "type-fest";

import { MigrationHelper } from "../migration-helper";
import { Migrator } from "../migrator";

/**
 * a no-op migrator that simply allows for updating the version number with no changes to the underlying state.
 * This is useful when a migration must be removed after other migration have been created.
 *
 * @remarks If you need to remove an existing migration, **IT IS REQUIRED** to validate that all following migrations are still valid as they may have been written to build upon the migration that is being removed.
 *
 * @remarks **NEVER REMOVE A MIGRATION THAT HAS BEEN RELEASED**
 */
export function buildNoopMigrator<TFrom extends number, TTo extends number>(
  from: TFrom,
  to: TTo,
): Constructor<Migrator<TFrom, TTo>> {
  return class extends Migrator<TFrom, TTo> {
    constructor() {
      super(from, to);
    }
    async migrate(helper: MigrationHelper): Promise<void> {
      // Do nothing
    }
    async rollback(helper: MigrationHelper): Promise<void> {
      // Do nothing
    }
  };
}
