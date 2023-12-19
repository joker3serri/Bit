import { Jsonify } from "type-fest";

import { StateDefinition } from "./state-definition";

type DeriveDefinitionOptions<TFrom, TTo, TDeps extends Record<string, Type<unknown>> = never> = {
  derive: (state: TFrom, deps: ShapeToInstances<TDeps>) => TTo | Promise<TTo>;
  deserializer: (serialized: Jsonify<TTo>) => TTo;
  dependencyShape?: TDeps;
  /**
   * The number of milliseconds to wait before cleaning up the state after the last subscriber has unsubscribed.
   * Defaults to 1000ms.
   */
  cleanupDelayMs?: number;
};

export class DeriveDefinition<TFrom, TTo, TDeps extends Record<string, Type<unknown>>> {
  constructor(
    readonly stateDefinition: StateDefinition,
    readonly uniqueDerivationName: string,
    readonly options: DeriveDefinitionOptions<TFrom, TTo, TDeps>,
  ) {}

  get derive() {
    return this.options.derive;
  }

  get cleanupDelayMs() {
    return this.options.cleanupDelayMs < 0 ? 0 : this.options.cleanupDelayMs ?? 1000;
  }

  buildCacheKey(): string {
    return `derived_${this.stateDefinition.name}_${this.uniqueDerivationName}`;
  }
}

/**
 * Creates a {@link StorageKey} that points to the data for the given derived definition.
 * @param derivedDefinition The derived definition of which data the key should point to.
 * @returns A key that is ready to be used in a storage service to get data.
 */
export function derivedKeyBuilder(
  deriveDefinition: DeriveDefinition<unknown, unknown, any>,
): StorageKey {
  return `derived_${deriveDefinition.stateDefinition.name}_${deriveDefinition.uniqueDerivationName}` as StorageKey;
}
