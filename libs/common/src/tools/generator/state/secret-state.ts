import { concatMap, firstValueFrom, zip } from "rxjs";

import { DerivedState, SingleUserState, StateUpdateOptions } from "../../../platform/state";

import { UserKeyEncryptor } from "./user-key-encryptor";

export class SecretState<Plaintext extends object, Exposed, Secret> {
  constructor(
    private encryptor: UserKeyEncryptor<Plaintext, Exposed, Secret>,
    private secretStore: SingleUserState<{ secret: string; public: Exposed }>,
    private plaintextStore: DerivedState<Plaintext>,
  ) {}

  get state$() {
    return this.plaintextStore.state$;
  }

  async update<TCombine>(
    configureState: (state: Plaintext, dependencies: TCombine) => Plaintext,
    options: StateUpdateOptions<Plaintext, TCombine>,
  ): Promise<Plaintext> {
    const deps$ = zip(this.plaintextStore.state$, options.combineLatestWith).pipe(
      concatMap(async ([currentState, combined]) => {
        // "impersonate" state storage interface
        const newState = configureState(currentState, combined);

        // map to storage format
        const [secret, exposed] = await this.encryptor.encrypt(newState);
        const newStoredState = {
          secret: secret.toJSON(),
          public: exposed,
        };

        return newStoredState;
      }),
    );

    await this.secretStore.update((_, newState) => newState, {
      combineLatestWith: deps$,
    });

    const latestValue = await firstValueFrom(this.plaintextStore.state$);
    return latestValue;
  }
}
