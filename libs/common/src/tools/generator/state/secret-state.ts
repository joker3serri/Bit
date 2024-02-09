import { concatMap, defaultIfEmpty, filter, firstValueFrom, from, zip } from "rxjs";

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

/** Stores account-specific secrets protected by a UserKeyEncryptor. */
export class SecretState<Plaintext extends object, Disclosed> {
  // The constructor is private to avoid creating a circular dependency when
  // wiring the derived and secret states together.
  private constructor(
    private readonly encryptor: UserEncryptor<Plaintext, Disclosed>,
    private readonly encrypted: SingleUserState<{ secret: string; public: Disclosed }>,
    private readonly plaintext: DerivedState<Plaintext>,
  ) {}

  // TODO: implement lock/unlock/etc support.
  /** Creates a secret state bound to an account encryptor. The account must be unlocked
   *  when this method is called.
   *  @param encryptor protects `Secret` data.
   *  @param key identifies the storage location for encrypted secrets. Secrets are written to
   *    the secret store as a named tuple. Secret data is jsonified, encrypted, and stored in
   *    a `secret` property. Disclosed data is stored in a `public` property.
   *  @param provider constructs state objects.
   *  @throws when `key.stateDefinition` is backed by memory storage.
   */
  static from<TFrom extends object, Disclosed>(
    userId: UserId,
    key: KeyDefinition<TFrom>,
    provider: StateProvider,
    encryptor: UserEncryptor<TFrom, Disclosed>,
  ) {
    // Memory storage is already encrypted, so if the caller provides a memory store,
    // let them know they're doing it wrong.
    if (key.stateDefinition.defaultStorageLocation === "memory") {
      throw new Error(`SecretState must back ${key.key} with permanent (not memory) storage.`);
    }

    type ClassifiedFormat = { secret: string; public: Disclosed };

    // construct encrypted backing store
    const secretKey = new KeyDefinition<ClassifiedFormat>(key.stateDefinition, key.key, {
      cleanupDelayMs: key.cleanupDelayMs,
      // `ClassifiedFormat` uses a type assertion because there isn't a straightforward
      // way to constrain `Disclosed` to stringify-able types.
      deserializer: (jsonValue) => jsonValue as ClassifiedFormat,
    });
    const encryptedState = provider.getUser(userId, secretKey);

    // construct plaintext store
    const plaintextDefinition = DeriveDefinition.from<ClassifiedFormat, TFrom>(secretKey, {
      derive: async (from) => {
        const secret = EncString.fromJSON(from.secret);
        const decrypted = await encryptor.decrypt(secret, from.public, encryptedState.userId);
        const value = key.deserializer(decrypted);
        return value;
      },
      deserializer: key.deserializer,
      cleanupDelayMs: key.cleanupDelayMs,
    });
    const plaintextState = provider.getDerived(encryptedState.state$, plaintextDefinition, null);

    // wrap the encrypted and secret states in a `SecretState` facade
    const secretState = new SecretState(encryptor, encryptedState, plaintextState);
    return secretState;
  }

  /** Observes changes to the decrypted secret state. The observer
   *  updates after the secret has been recorded to state storage.
   *  @returns `undefined` when the account is locked.
   */
  get state$() {
    return this.plaintext.state$;
  }

  /** Updates the secret stored by this state.
   *  @param configureState a callback that returns an updated decrypted
   *   secret state. The callback receives the state's present value as its
   *   first argument and the dependencies listed in `options.combinedLatestWith`
   *   as its second argument. Return `null` to clear the state store. Returning
   *   `undefined` has no effect.
   *  @param options configures how the update is applied. {@link StateUpdateOptions}
   *  @returns a promise that resolves with the updated value read from the state.
   *   The round-trip encrypts, decrypts, and deserializes the data, producing a new
   *   object.
   */
  async update<TCombine>(
    configureState: (state: Plaintext, dependencies: TCombine) => Plaintext,
    options: StateUpdateOptions<Plaintext, TCombine> = null,
  ): Promise<Plaintext> {
    const combined$ = options?.combineLatestWith ?? from([undefined]);

    const newState$ = zip(this.plaintext.state$, combined$).pipe(
      filter(([currentState, combined]) => {
        if (options.shouldUpdate) {
          return options.shouldUpdate(currentState, combined);
        } else {
          return false;
        }
      }),
      concatMap(async ([currentState, combined]) => {
        // "impersonate" state storage interface
        const newState = configureState(currentState, combined);
        if (newState === undefined) {
          return undefined;
        }

        // map to storage format
        const [secret, disclosed] = await this.encryptor.encrypt(newState, this.encrypted.userId);
        const newStoredState = {
          secret: secret.toJSON(),
          public: disclosed,
        };

        return newStoredState;
      }),
      defaultIfEmpty(undefined),
    );

    await this.encrypted.update(
      (currentState, newState) => (newState === undefined ? currentState : newState),
      {
        combineLatestWith: newState$,
        shouldUpdate: (_current, newState) => newState !== undefined,
      },
    );

    const latestValue = await firstValueFrom(this.plaintext.state$);
    return latestValue;
  }
}
