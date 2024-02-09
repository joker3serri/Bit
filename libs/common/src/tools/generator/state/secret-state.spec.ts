import { mock } from "jest-mock-extended";
import { firstValueFrom } from "rxjs";

import { FakeStateProvider, makeEncString, mockAccountServiceWith } from "../../../../spec";
import { KeyDefinition, GENERATOR_DISK, GENERATOR_MEMORY } from "../../../platform/state";
import { UserId } from "../../../types/guid";

import { SecretState } from "./secret-state";
import { UserEncryptor } from "./user-encryptor.abstraction";

type FooBar = { foo: boolean; bar: boolean };
const FOOBAR_KEY = new KeyDefinition<FooBar>(GENERATOR_DISK, "fooBar", {
  deserializer: (fb) => fb,
});
const SomeUser = "some user" as UserId;

function mockEncryptor<Disclosed>(secret = "", disclosed: Disclosed = {} as any) {
  const result = mock<UserEncryptor<FooBar, Disclosed>>({
    encrypt() {
      return Promise.resolve([makeEncString(secret), disclosed] as const);
    },
  });
  return result;
}

async function fakeStateProvider(fb: FooBar = null) {
  const accountService = mockAccountServiceWith(SomeUser);
  const stateProvider = new FakeStateProvider(accountService);
  await stateProvider.setUserState(FOOBAR_KEY, fb, SomeUser);
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
    // FIXME: this times out because the derive/plaintext is not calculating
    it("gets a set value", async () => {
      const provider = await fakeStateProvider();
      const encryptor = mockEncryptor();
      const state = SecretState.from(SomeUser, FOOBAR_KEY, provider, encryptor);
      const value = { foo: true, bar: false };

      await state.update(() => value);
      const result = await firstValueFrom(state.state$);

      expect(result).toEqual(value);
    });

    // it("", async () => {
    //   const provider = await fakeStateProvider();
    //   const encryptor = mockEncryptor();

    //   const state = SecretState.from(SomeUser, FOOBAR_KEY, provider, encryptor);
    // });
  });
});
