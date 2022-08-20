// @ts-strict-ignore
export abstract class StateMigrationService {
  needsMigration: () => Promise<boolean>;
  migrate: () => Promise<void>;
}
