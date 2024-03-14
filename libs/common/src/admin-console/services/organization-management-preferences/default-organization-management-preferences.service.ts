import { map } from "rxjs";
import { Jsonify } from "type-fest";

import {
  ORGANIZATION_MANAGEMENT_PREFERENCES_DISK,
  StateProvider,
  UserKeyDefinition,
} from "../../../platform/state";
import {
  OrganizationManagementPreference,
  OrganizationManagementPreferencesService,
} from "../../abstractions/organization-management-preferences/organization-management-preferences.service";

/**
 * This helper function can be used to quickly create `KeyDefinitions` that
 * target the `ORGANIZATION_MANAGEMENT_PREFERENCES_DISK` `StateDefinition`
 * and that have the default deserializer and `clearOn` options. Any
 * contenders for options to add to this service will likely use these same
 * options.
 */
function buildKeyDefinition<T>(key: string): UserKeyDefinition<T> {
  return new UserKeyDefinition<T>(ORGANIZATION_MANAGEMENT_PREFERENCES_DISK, key, {
    deserializer: (obj: Jsonify<T>) => obj as T,
    clearOn: ["logout"],
  });
}

export const AUTO_CONFIRM_FINGERPRINTS = buildKeyDefinition<boolean>("autoConfirmFingerPrints");

export class DefaultOrganizationManagementPreferencesService
  implements OrganizationManagementPreferencesService
{
  constructor(private stateProvider: StateProvider) {}

  autoConfirmFingerPrints = this.buildOrganizationManagementPreference(
    AUTO_CONFIRM_FINGERPRINTS,
    false,
  );

  /**
   * Returns an `OrganizationManagementPreference` object for the provided
   * `KeyDefinition`. This object can then be used by callers to subscribe to
   * a given key, or update its value in state.
   */
  private buildOrganizationManagementPreference<T>(
    keyDefinition: UserKeyDefinition<T>,
    defaultValue: T,
  ) {
    return new OrganizationManagementPreference<T>(
      this.getKeyFromState(keyDefinition).state$.pipe(map((x) => x ?? defaultValue)),
      this.updateKeyInStateFn(keyDefinition),
    );
  }

  /**
   * Returns the full `ActiveUserState` value for a given `keyDefinition`
   * The returned value can then be called for subscription || update operations
   */
  private getKeyFromState<T>(keyDefinition: UserKeyDefinition<T>) {
    return this.stateProvider.getActive(keyDefinition);
  }

  /**
   * Returns a function that can be called to update the given `keyDefinition` in state
   */
  private updateKeyInStateFn<T>(keyDefinition: UserKeyDefinition<T>) {
    return async (value: T) => {
      await this.getKeyFromState(keyDefinition).update(() => value);
    };
  }
}
