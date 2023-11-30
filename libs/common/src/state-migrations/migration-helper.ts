// eslint-disable-next-line import/no-restricted-paths -- Needed to print log messages
import { LogService } from "../platform/abstractions/log.service";
// eslint-disable-next-line import/no-restricted-paths -- Needed to interface with storage locations
import { AbstractStorageService } from "../platform/abstractions/storage.service";

export class MigrationHelper {
  constructor(
    public currentVersion: number,
    private storageService: AbstractStorageService,
    public logService: LogService
  ) {}

  get<T>(key: string): Promise<T> {
    return this.storageService.get<T>(key);
  }

  set<T>(key: string, value: T): Promise<void> {
    this.logService.info(`Setting ${key}`);
    return this.storageService.save(key, value);
  }

  info(message: string): void {
    this.logService.info(message);
  }

  async getAccounts<ExpectedAccountType>(): Promise<
    { userId: string; account: ExpectedAccountType }[]
  > {
    const userIds = (await this.get<string[]>("authenticatedAccounts")) ?? [];
    return Promise.all(
      userIds.map(async (userId) => ({
        userId,
        account: await this.get<ExpectedAccountType>(userId),
      }))
    );
  }

  /**
   * Builds a user storage key appropriate for the current version.
   *
   * @param userId userId to use in the key
   * @param keyDefinition state and key to use in the key
   * @returns
   */
  getUserKey(
    userId: string,
    keyDefinition: {
      stateDefinition: { name: string };
      key: string;
    }
  ): string {
    if (this.currentVersion < 10) {
      return userKeyBuilderPre10(userId, keyDefinition);
    } else {
      return userKeyBuilder(userId, keyDefinition);
    }
  }

  /**
   * Builds a global storage key appropriate for the current version.
   *
   * @param keyDefinition state and key to use in the key
   * @returns
   */
  getGlobalKey(keyDefinition: { stateDefinition: { name: string }; key: string }): string {
    if (this.currentVersion < 10) {
      return globalKeyBuilderPre10(keyDefinition);
    } else {
      return globalKeyBuilder(keyDefinition);
    }
  }
}

/**
 * When this is updated, rename this function to `userKeyBuilderXToY` where `X` is the version number it
 * became relevant, and `Y` prior to the version it was updated.
 *
 * Be sure to update the map in `MigrationHelper` to point to the appropriate function for the current version.
 * @param userId The userId of the user you want the key to be for.
 * @param keyDefinition the key definition of which data the key should point to.
 * @returns
 */
export function userKeyBuilder(
  userId: string,
  keyDefinition: { stateDefinition: { name: string }; key: string }
): string {
  return `user_${userId}_${keyDefinition.stateDefinition.name}_${keyDefinition.key}`;
}

export function userKeyBuilderPre10(
  userId: string,
  keyDefinition: { stateDefinition: { name: string }; key: string }
): string {
  throw Error("No key builder should be used for versions prior to 10.");
}

/**
 * When this is updated, rename this function to `globalKeyBuilderXToY` where `X` is the version number
 * it became relevant, and `Y` prior to the version it was updated.
 *
 * Be sure to update the map in `MigrationHelper` to point to the appropriate function for the current version.
 * @param keyDefinition the key definition of which data the key should point to.
 * @returns
 */
export function globalKeyBuilder(keyDefinition: {
  stateDefinition: { name: string };
  key: string;
}): string {
  return `global_${keyDefinition.stateDefinition.name}_${keyDefinition.key}`;
}

export function globalKeyBuilderPre10(keyDefinition: {
  stateDefinition: { name: string };
  key: string;
}): string {
  throw Error("No key builder should be used for versions prior to 10.");
}
