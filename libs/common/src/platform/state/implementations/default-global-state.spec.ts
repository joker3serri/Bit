/**
 * need to update test environment so trackEmissions works appropriately
 * @jest-environment ../shared/test.environment.ts
 */

import { anySymbol } from "jest-mock-extended";
import { firstValueFrom, of, timeout } from "rxjs";
import { Jsonify } from "type-fest";

import { trackEmissions, awaitAsync } from "../../../../spec";
import { FakeStorageService } from "../../../../spec/fake-storage.service";
import { KeyDefinition, globalKeyBuilder } from "../key-definition";
import { StateDefinition } from "../state-definition";

import { DefaultGlobalState } from "./default-global-state";

class TestState {
  date: Date;

  static fromJSON(jsonState: Jsonify<TestState>) {
    if (jsonState == null) {
      return null;
    }

    return Object.assign(new TestState(), jsonState, {
      date: new Date(jsonState.date),
    });
  }
}

const testStateDefinition = new StateDefinition("fake", "disk");
const cleanupDelayMs = 10;
const testKeyDefinition = new KeyDefinition<TestState>(testStateDefinition, "fake", {
  deserializer: TestState.fromJSON,
  cleanupDelayMs,
});
const globalKey = globalKeyBuilder(testKeyDefinition);

describe("DefaultGlobalState", () => {
  let diskStorageService: FakeStorageService;
  let globalState: DefaultGlobalState<TestState>;
  const newData = { date: new Date() };

  beforeEach(() => {
    diskStorageService = new FakeStorageService();
    globalState = new DefaultGlobalState(testKeyDefinition, diskStorageService);
  });

  afterEach(() => {
    jest.resetAllMocks();
  });

  describe("state$", () => {
    it("should emit when storage updates", async () => {
      const emissions = trackEmissions(globalState.state$);
      await diskStorageService.save(globalKey, newData);
      await awaitAsync();

      expect(emissions).toEqual([
        null, // Initial value
        newData,
      ]);
    });

    it("should not emit when update key does not match", async () => {
      const emissions = trackEmissions(globalState.state$);
      await diskStorageService.save("wrong_key", newData);

      expect(emissions).toHaveLength(0);
    });

    it("should emit initial storage value on first subscribe", async () => {
      const initialStorage: Record<string, TestState> = {};
      initialStorage[globalKey] = TestState.fromJSON({
        date: "2022-09-21T13:14:17.648Z",
      });
      diskStorageService.internalUpdateStore(initialStorage);

      const state = await firstValueFrom(globalState.state$);
      expect(diskStorageService.mock.get).toHaveBeenCalledTimes(1);
      expect(diskStorageService.mock.get).toHaveBeenCalledWith("global_fake_fake", undefined);
      expect(state).toBeTruthy();
    });

    it("should not emit twice if there are two listeners", async () => {
      const emissions = trackEmissions(globalState.state$);
      const emissions2 = trackEmissions(globalState.state$);
      await awaitAsync();

      expect(emissions).toEqual([
        null, // Initial value
      ]);
      expect(emissions2).toEqual([
        null, // Initial value
      ]);
    });
  });

  describe("update", () => {
    it("should save on update", async () => {
      const result = await globalState.update((state) => {
        return newData;
      });

      expect(diskStorageService.mock.save).toHaveBeenCalledTimes(1);
      expect(result).toEqual(newData);
    });

    it("should emit once per update", async () => {
      const emissions = trackEmissions(globalState.state$);
      await awaitAsync(); // storage updates are behind a promise

      await globalState.update((state) => {
        return newData;
      });

      await awaitAsync();

      expect(emissions).toEqual([
        null, // Initial value
        newData,
      ]);
    });

    it("should provided combined dependencies", async () => {
      const emissions = trackEmissions(globalState.state$);
      await awaitAsync(); // storage updates are behind a promise

      const combinedDependencies = { date: new Date() };

      await globalState.update(
        (state, dependencies) => {
          expect(dependencies).toEqual(combinedDependencies);
          return newData;
        },
        {
          combineLatestWith: of(combinedDependencies),
        },
      );

      await awaitAsync();

      expect(emissions).toEqual([
        null, // Initial value
        newData,
      ]);
    });

    it("should not update if shouldUpdate returns false", async () => {
      const emissions = trackEmissions(globalState.state$);
      await awaitAsync(); // storage updates are behind a promise

      const result = await globalState.update(
        (state) => {
          return newData;
        },
        {
          shouldUpdate: () => false,
        },
      );

      expect(diskStorageService.mock.save).not.toHaveBeenCalled();
      expect(emissions).toEqual([null]); // Initial value
      expect(result).toBeNull();
    });

    it("should provide the update callback with the current State", async () => {
      const emissions = trackEmissions(globalState.state$);
      await awaitAsync(); // storage updates are behind a promise

      // Seed with interesting data
      const initialData = { date: new Date(2020, 1, 1) };
      await globalState.update((state, dependencies) => {
        return initialData;
      });

      await awaitAsync();

      await globalState.update((state) => {
        expect(state).toEqual(initialData);
        return newData;
      });

      await awaitAsync();

      expect(emissions).toEqual([
        null, // Initial value
        initialData,
        newData,
      ]);
    });

    it("should give initial state for update call", async () => {
      const initialStorage: Record<string, TestState> = {};
      const initialState = TestState.fromJSON({
        date: "2022-09-21T13:14:17.648Z",
      });
      initialStorage[globalKey] = initialState;
      diskStorageService.internalUpdateStore(initialStorage);

      const emissions = trackEmissions(globalState.state$);
      await awaitAsync(); // storage updates are behind a promise

      const newState = {
        ...initialState,
        date: new Date(initialState.date.getFullYear(), initialState.date.getMonth() + 1),
      };
      const actual = await globalState.update((existingState) => newState);

      await awaitAsync();

      expect(actual).toEqual(newState);
      expect(emissions).toHaveLength(2);
      expect(emissions).toEqual(expect.arrayContaining([initialState, newState]));
    });
  });

  describe("update races", () => {
    test("subscriptions during an update should not emit until update is complete", async () => {
      // Seed with interesting data
      const initialData = { date: new Date(2020, 1, 1) };
      await globalState.update((state, dependencies) => {
        return initialData;
      });

      await awaitAsync();

      const emissions = trackEmissions(globalState.state$);
      await awaitAsync();
      expect(emissions).toEqual([initialData]);

      const originalSave = diskStorageService.save.bind(diskStorageService);
      diskStorageService.save = jest.fn().mockImplementation(async (key: string, obj: any) => {
        await expect(() => firstValueFrom(globalState.state$.pipe(timeout(100)))).rejects.toThrow();
        await originalSave(key, obj);
      });

      const val = await globalState.update((state) => {
        return newData;
      });

      await awaitAsync();

      expect(val).toEqual(newData);
      expect(emissions).toEqual([initialData, newData]);
    });

    test("updates should wait until previous update is complete", async () => {
      trackEmissions(globalState.state$);
      await awaitAsync(); // storage updates are behind a promise

      const originalSave = diskStorageService.save.bind(diskStorageService);
      diskStorageService.save = jest
        .fn()
        .mockImplementationOnce(async () => {
          let resolved = false;
          await Promise.race([
            globalState.update(() => {
              // deadlocks
              resolved = true;
              return newData;
            }),
            awaitAsync(100), // limit test to 100ms
          ]);
          expect(resolved).toBe(false);
        })
        .mockImplementation(originalSave);

      await globalState.update((state) => {
        return newData;
      });
    });

    test("updates with FAKE_DEFAULT initial value should resolve correctly", async () => {
      expect(globalState["stateSubject"].value).toEqual(anySymbol()); // FAKE_DEFAULT
      const val = await globalState.update((state) => {
        return newData;
      });

      expect(val).toEqual(newData);
      const call = diskStorageService.mock.save.mock.calls[0];
      expect(call[0]).toEqual("global_fake_fake");
      expect(call[1]).toEqual(newData);
    });
  });

  describe("cleanup", () => {
    async function assertClean() {
      const emissions = trackEmissions(globalState["stateSubject"]);
      const initial = structuredClone(emissions);

      diskStorageService.save(globalKey, newData);
      await awaitAsync(); // storage updates are behind a promise

      expect(emissions).toEqual(initial); // no longer listening to storage updates
    }

    it("should cleanup after last subscriber", async () => {
      const subscription = globalState.state$.subscribe();
      await awaitAsync(); // storage updates are behind a promise

      subscription.unsubscribe();
      expect(globalState["subscriberCount"].getValue()).toBe(0);
      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      await assertClean();
    });

    it("should not cleanup if there are still subscribers", async () => {
      const subscription1 = globalState.state$.subscribe();
      const sub2Emissions: TestState[] = [];
      const subscription2 = globalState.state$.subscribe((v) => sub2Emissions.push(v));
      await awaitAsync(); // storage updates are behind a promise

      subscription1.unsubscribe();

      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      expect(globalState["subscriberCount"].getValue()).toBe(1);

      // Still be listening to storage updates
      diskStorageService.save(globalKey, newData);
      await awaitAsync(); // storage updates are behind a promise
      expect(sub2Emissions).toEqual([null, newData]);

      subscription2.unsubscribe();
      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      await assertClean();
    });

    it("can re-initialize after cleanup", async () => {
      const subscription = globalState.state$.subscribe();
      await awaitAsync();

      subscription.unsubscribe();
      // Wait for cleanup
      await awaitAsync(cleanupDelayMs * 2);

      const emissions = trackEmissions(globalState.state$);
      await awaitAsync();

      diskStorageService.save(globalKey, newData);
      await awaitAsync();

      expect(emissions).toEqual([null, newData]);
    });

    it("should not cleanup if a subscriber joins during the cleanup delay", async () => {
      const subscription = globalState.state$.subscribe();
      await awaitAsync();

      await diskStorageService.save(globalKey, newData);
      await awaitAsync();

      subscription.unsubscribe();
      expect(globalState["subscriberCount"].getValue()).toBe(0);
      // Do not wait long enough for cleanup
      await awaitAsync(cleanupDelayMs / 2);

      expect(globalState["stateSubject"].value).toEqual(newData); // digging in to check that it hasn't been cleared
      expect(globalState["storageUpdateSubscription"]).not.toBeNull(); // still listening to storage updates
    });
  });
});
