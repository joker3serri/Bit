import { mock } from "jest-mock-extended";
import { firstValueFrom, from } from "rxjs";

import {
  FakeStateProvider,
  makeEncString,
  mockAccountServiceWith,
  awaitAsync,
} from "../../../../spec";
import { EncString } from "../../../platform/models/domain/enc-string";
import { KeyDefinition, GENERATOR_DISK, GENERATOR_MEMORY } from "../../../platform/state";
import { UserId } from "../../../types/guid";

import { SecretState } from "./secret-state";
import { UserEncryptor } from "./user-encryptor.abstraction";

type FooBar = { foo: boolean; bar: boolean };
const FOOBAR_KEY = new KeyDefinition<FooBar>(GENERATOR_DISK, "fooBar", {
  deserializer: (fb) => fb,
});
const SomeUser = "some user" as UserId;

function mockEncryptor(fooBar: FooBar[] = []): UserEncryptor<FooBar, Record<string, never>> {
  // stores "encrypted values" so that they can be "decrypted" later
  // while allowing the operations to be interleaved.
  const encrypted = new Map<string, FooBar>(
    fooBar.map((fb) => [toKey(fb).encryptedString, fb] as const),
  );

  const result = mock<UserEncryptor<FooBar, Record<string, never>>>({
    encrypt(value: FooBar, user: UserId) {
      const encString = toKey(value);
      encrypted.set(encString.encryptedString, value);
      return Promise.resolve([encString, {}]);
    },
    decrypt(secret: EncString, disclosed: Record<string, never>, userId: UserId) {
      const decString = encrypted.get(secret.encryptedString);
      return Promise.resolve(decString);
    },
  });

  function toKey(value: FooBar) {
    // `stringify` is only relevant for its uniqueness as a key
    // to `encrypted`.
    return makeEncString(JSON.stringify(value));
  }

  // chromatic pops a false positive about missing `encrypt` and `decrypt`
  // functions, so assert the type manually.
  return result as unknown as UserEncryptor<FooBar, Record<string, never>>;
}

async function fakeStateProvider() {
  const accountService = mockAccountServiceWith(SomeUser);
  const stateProvider = new FakeStateProvider(accountService);
  return stateProvider;
}

describe("UserEncryptor", () => {
  describe("from", () => {
    it("from throws when given a memory store", () => {
      const key = new KeyDefinition<FooBar>(GENERATOR_MEMORY, "soGonnaFail", {
        deserializer: () => null,
      });

      expect.assertions(1);
      expect(() => SecretState.from(SomeUser, key, null, null)).toThrow(
        "SecretState must back soGonnaFail with permanent (not memory) storage.",
      );
    });

    it("returns a state store", async () => {
      const provider = await fakeStateProvider();
      const encryptor = mockEncryptor();

      const result = SecretState.from(SomeUser, FOOBAR_KEY, provider, encryptor);

      expect(result).toBeInstanceOf(SecretState);
    });
  });

  describe("instance", () => {
    it("gets a set value", async () => {
      const provider = await fakeStateProvider();
      const encryptor = mockEncryptor();
      const state = SecretState.from(SomeUser, FOOBAR_KEY, provider, encryptor);
      const value = { foo: true, bar: false };

      await state.update(() => value);
      await awaitAsync();
      const result = await firstValueFrom(state.state$);

      expect(result).toEqual(value);
    });

    it("gets the last set value", async () => {
      const provider = await fakeStateProvider();
      const encryptor = mockEncryptor();
      const state = SecretState.from(SomeUser, FOOBAR_KEY, provider, encryptor);
      const initialValue = { foo: true, bar: false };
      const replacementValue = { foo: false, bar: false };

      await state.update(() => initialValue);
      await state.update(() => replacementValue);
      await awaitAsync();
      const result = await firstValueFrom(state.state$);

      expect(result).toEqual(replacementValue);
    });

    it("interprets shouldUpdate option", async () => {
      const provider = await fakeStateProvider();
      const encryptor = mockEncryptor();
      const state = SecretState.from(SomeUser, FOOBAR_KEY, provider, encryptor);
      const initialValue = { foo: true, bar: false };
      const replacementValue = { foo: false, bar: false };

      await state.update(() => initialValue, { shouldUpdate: () => true });
      await state.update(() => replacementValue, { shouldUpdate: () => false });
      const result = await firstValueFrom(state.state$);

      expect(result).toEqual(initialValue);
    });

    it("sets the state to `null` when `update` returns `null`", async () => {
      const provider = await fakeStateProvider();
      const encryptor = mockEncryptor();
      const state = SecretState.from(SomeUser, FOOBAR_KEY, provider, encryptor);
      const value = { foo: true, bar: false };

      await state.update(() => value);
      await state.update(() => null);
      await awaitAsync();
      const result = await firstValueFrom(state.state$);

      expect(result).toEqual(null);
    });

    it("sets the state to `null` when `update` returns `undefined`", async () => {
      const provider = await fakeStateProvider();
      const encryptor = mockEncryptor();
      const state = SecretState.from(SomeUser, FOOBAR_KEY, provider, encryptor);
      const value = { foo: true, bar: false };

      await state.update(() => value);
      await state.update(() => undefined);
      await awaitAsync();
      const result = await firstValueFrom(state.state$);

      expect(result).toEqual(null);
    });

    it("sends rxjs observables into the shouldUpdate method", async () => {
      const provider = await fakeStateProvider();
      const encryptor = mockEncryptor();
      const state = SecretState.from(SomeUser, FOOBAR_KEY, provider, encryptor);
      const combinedWith$ = from([1]);
      let combinedShouldUpdate = 0;

      await state.update((value) => value, {
        shouldUpdate: (_, combined) => {
          combinedShouldUpdate = combined;
          return true;
        },
        combineLatestWith: combinedWith$,
      });

      expect(combinedShouldUpdate).toEqual(1);
    });

    it("sends rxjs observables into the update method", async () => {
      const provider = await fakeStateProvider();
      const encryptor = mockEncryptor();
      const state = SecretState.from(SomeUser, FOOBAR_KEY, provider, encryptor);
      const combinedWith$ = from([1]);
      let combinedUpdate = 0;

      await state.update(
        (value, combined) => {
          combinedUpdate = combined;
          return value;
        },
        {
          combineLatestWith: combinedWith$,
        },
      );

      expect(combinedUpdate).toEqual(1);
    });
  });
});
