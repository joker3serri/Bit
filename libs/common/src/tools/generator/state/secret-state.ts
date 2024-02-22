import { Observable, concatMap, of, zip } from "rxjs";
import { Jsonify } from "type-fest";

import { EncString } from "../../../platform/models/domain/enc-string";
import {
  DeriveDefinition,
  DerivedState,
  KeyDefinition,
  SingleUserState,
  StateProvider,
  StateUpdateOptions,
} from "../../../platform/state";
import { UserId } from "../../../types/guid";

import { UserEncryptor } from "./user-encryptor.abstraction";

/** Stores account-specific secrets protected by a UserKeyEncryptor.
 *
 *  @remarks This state store changes the structure of `Plaintext` during
 *  storage, and requires user keys to operate. It is incompatible with sync,
 *  which expects the disk storage format to be identical to the sync format.
 *
 *  DO NOT USE THIS for synchronized data. Consider, instead, storing
 *  synchronized data in a separate storage location, and bridging the sync
 *  data to a SecretStore when the key becomes available.
 */
export class SecretState<Plaintext extends object, Disclosed> {
  // The constructor is private to avoid creating a circular dependency when
  // wiring the derived and secret states together.
  private constructor(
    private readonly encryptor: UserEncryptor<Plaintext, Disclosed>,
    private readonly encrypted: SingleUserState<{ secret: string; public: Jsonify<Disclosed> }>,
    private readonly plaintext: DerivedState<Plaintext>,
  ) {
    this.state$ = plaintext.state$;
  }

  /** Creates a secret state bound to an account encryptor. The account must be unlocked
   *  when this method is called.
   *  @param userId: the user to which the secret state is bound.
   *  @param key identifies the storage location for encrypted secrets. Secrets are written to
   *    the secret store as a named tuple. Secret data is jsonified, encrypted, and stored in
   *    a `secret` property. Disclosed data is stored in a `public` property.
   *  @param provider constructs state objects.
   *  @param encryptor protects `Secret` data.
   *  @throws when `key.stateDefinition` is backed by memory storage.
   */
  static from<TFrom extends object, Disclosed>(
    userId: UserId,
    key: KeyDefinition<TFrom>,
    provider: StateProvider,
    encryptor: UserEncryptor<TFrom, Disclosed>,
  ) {
    // The secret state requires that data has round-tripped through a serialized storage
    // format. Memory storage does not make that guarantee, so it cannot back the secret state.
    if (key.stateDefinition.defaultStorageLocation === "memory") {
      throw new Error(`SecretState must back ${key.key} with permanent (not memory) storage.`);
    }

    type ClassifiedFormat = { secret: string; public: Jsonify<Disclosed> };

    // construct encrypted backing store
    const secretKey = new KeyDefinition<ClassifiedFormat>(key.stateDefinition, key.key, {
      cleanupDelayMs: key.cleanupDelayMs,
      // `ClassifiedFormat` uses a type assertion because there isn't a straightforward
      // way to constrain `Disclosed` to stringify-able types.
      // FIXME: When the fakes run deserializers and serialization can be guaranteed through
      // state providers, decode `jsonValue.secret` instead of it running in `derive`.
      deserializer: (jsonValue) => jsonValue as ClassifiedFormat,
    });
    const encryptedState = provider.getUser(userId, secretKey);

    // construct plaintext store
    const plaintextDefinition = DeriveDefinition.from<ClassifiedFormat, TFrom>(secretKey, {
      derive: async (from) => {
        // fail fast if there's no value
        if (from === null || from === undefined) {
          return null;
        }

        // otherwise forward the decrypted data to the caller's deserializer
        const secret = EncString.fromJSON(from.secret);
        const decrypted = await encryptor.decrypt(secret, from.public, encryptedState.userId);
        const value = key.deserializer(decrypted);

        return value;
      },
      // wire in the caller's deserializer for memory serialization
      deserializer: key.deserializer,
      // cache the decrypted data in memory
      cleanupDelayMs: key.cleanupDelayMs,
    });
    const plaintextState = provider.getDerived(encryptedState.state$, plaintextDefinition, null);

    // wrap the encrypted and plaintext states in a `SecretState` facade
    const secretState = new SecretState(encryptor, encryptedState, plaintextState);
    return secretState;
  }

  /** Observes changes to the decrypted secret state. The observer
   *  updates after the secret has been recorded to state storage.
   *  @returns `undefined` when the account is locked.
   */
  readonly state$: Observable<Plaintext>;

  /** Updates the secret stored by this state.
   *  @param configureState a callback that returns an updated decrypted
   *   secret state. The callback receives the state's present value as its
   *   first argument and the dependencies listed in `options.combinedLatestWith`
   *   as its second argument.
   *  @param options configures how the update is applied. See {@link StateUpdateOptions}.
   *  @returns a promise that resolves with the updated value read from the state.
   *   The round-trip encrypts, decrypts, and deserializes the data, producing a new
   *   object.
   *  @remarks `configureState` must return a JSON-serializable object.
   *   If there are properties of your class which are not JSON-serializable,
   *   they can be lost when the secret state updates its backing store.
   */
  async update<TCombine>(
    configureState: (state: Plaintext, dependencies: TCombine) => Plaintext,
    options: StateUpdateOptions<Plaintext, TCombine> = null,
  ): Promise<Plaintext> {
    // reactively grab the latest state from the caller. `zip` requires each
    // observable has a value, so `combined$` provides a default if necessary.
    const combined$ = options?.combineLatestWith ?? of(undefined);
    const newState$ = zip(this.plaintext.state$, combined$).pipe(
      concatMap(([currentState, combined]) =>
        this.prepareCryptoState(
          currentState,
          () => options?.shouldUpdate?.(currentState, combined) ?? true,
          () => configureState(currentState, combined),
        ),
      ),
    );

    // update the backing store
    let latestValue: Plaintext = null;
    await this.encrypted.update((_, [, newStoredState]) => newStoredState, {
      combineLatestWith: newState$,
      shouldUpdate: (_, [shouldUpdate, , newState]) => {
        // need to grab the latest value from the closure since the derived state
        // could return its cached value, and this must be done in `shouldUpdate`
        // because `configureState` may not run.
        latestValue = newState;
        return shouldUpdate;
      },
    });

    return latestValue;
  }

  private async prepareCryptoState(
    currentState: Plaintext,
    shouldUpdate: () => boolean,
    configureState: () => Plaintext,
  ): Promise<[boolean, { secret: string; public: Jsonify<Disclosed> }, Plaintext]> {
    // determine whether an update is necessary
    if (!shouldUpdate()) {
      return [false, undefined, currentState];
    }

    // calculate the update
    const newState = configureState();
    if (newState === null || newState === undefined) {
      return [true, newState as any, newState];
    }

    // map to storage format
    const [secret, disclosed] = await this.encryptor.encrypt(newState, this.encrypted.userId);

    // the deserializer in the plaintextState's `derive` configuration always runs, but
    // `encryptedState` is not guaranteed to serialize the data, so it's necessary to
    // round-trip it proactively. This will cause some duplicate work in those situations
    // where the backing store does deserialize the data.
    //
    // FIXME: Once there's a backing store configuration setting guaranteeing serialization,
    // remove this code and configure the backing store as appropriate.
    const serializedDisclosed = JSON.parse(JSON.stringify(disclosed));
    const newStoredState = {
      secret: secret.toJSON(),
      public: serializedDisclosed,
    };

    return [true, newStoredState, newState];
  }
}
