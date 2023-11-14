import { mock } from "jest-mock-extended";

import { FakeStorageService } from "../../../spec/fake-storage.service";
import { MigrationHelper } from "../migration-helper";
import { Migrator } from "../migrator";

import { MoveBrowserSettingsToGlobal } from "./9-move-browser-settings-to-global";

type TestState = { authenticatedAccounts: string[] } & { [key: string]: unknown };

// This could become a helper available to anyone
const runMigrator = async <TMigrator extends Migrator<number, number>>(
  migrator: TMigrator,
  initalData?: Record<string, unknown>
): Promise<Record<string, unknown>> => {
  const fakeStorageService = new FakeStorageService(initalData);
  const helper = new MigrationHelper(migrator.fromVersion, fakeStorageService, mock());
  await migrator.migrate(helper);
  return fakeStorageService.internalStore;
};

describe("MoveBrowserSettingsToGlobal", () => {
  const myMigrator = new MoveBrowserSettingsToGlobal(8, 9);
  it("realistic browser user who hasn't updated any of the applicable settings", async () => {
    const testInput: TestState = {
      authenticatedAccounts: ["user1"],
      global: {
        theme: "system", // A real global setting that should persist after migration
      },
      user1: {
        settings: {
          region: "Self-hosted",
        },
      },
    };

    const output = await runMigrator(myMigrator, testInput);

    // No additions to the global state
    expect(output["global"]).toEqual({
      theme: "system",
    });

    // No additions to user state
    expect(output["user1"]).toEqual({
      settings: {
        region: "Self-hosted",
      },
    });
  });

  it("realistic browser user who has toggled the settings but put them back to default value", async () => {
    const testInput: TestState = {
      authenticatedAccounts: ["user1"],
      global: {
        theme: "system", // A real global setting that should persist after migration
      },
      user1: {
        settings: {
          disableAddLoginNotification: false,
          disableChangedPasswordNotification: false,
          neverDomains: {
            "example.com": null,
          },
          region: "Self-hosted",
        },
      },
    };

    const output = await runMigrator(myMigrator, testInput);

    // User settings should have moved to global
    expect(output["global"]).toEqual({
      theme: "system",
      disableAddLoginNotification: false,
      disableChangedPasswordNotification: false,
      neverDomains: {
        "example.com": null,
      },
    });

    // Migrated settings should be deleted
    expect(output["user1"]).toEqual({
      settings: { region: "Self-hosted" },
    });
  });

  it("realistic browser user who has toggled the settings to a value that is not the default", async () => {
    const testInput: TestState = {
      authenticatedAccounts: ["user1"],
      global: {
        theme: "system", // A real global setting that should persist after migration
      },
      user1: {
        settings: {
          disableAddLoginNotification: true,
          disableChangedPasswordNotification: true,
          neverDomains: {
            "example.com": null,
          },
          region: "Self-hosted",
        },
      },
    };

    const output = await runMigrator(myMigrator, testInput);

    // The value for the single user value should be set to global
    expect(output["global"]).toEqual({
      theme: "system",
      disableAddLoginNotification: true,
      disableChangedPasswordNotification: true,
      neverDomains: {
        "example.com": null,
      },
    });

    expect(output["user1"]).toEqual({
      settings: { region: "Self-hosted" },
    });
  });

  it("realistic browser who has two users, one account disabled the notifications and one didn't, should have it be disabled.", async () => {
    const testInput: TestState = {
      authenticatedAccounts: ["user1", "user2"],
      global: {
        theme: "system", // A real global setting that should persist after migration
      },
      user1: {
        settings: {
          disableAddLoginNotification: true,
          disableChangedPasswordNotification: true,
          neverDomains: {
            "example.com": null,
          },
          region: "Self-hosted",
        },
      },
      user2: {
        settings: {
          disableAddLoginNotification: false,
          disableChangedPasswordNotification: false,
          neverDomains: {
            "example2.com": null,
          },
          region: "Self-hosted",
        },
      },
    };

    const output = await runMigrator(myMigrator, testInput);

    // The false settings should be respected over the true values
    // neverDomains should be combined into a single object
    expect(output["global"]).toEqual({
      theme: "system",
      disableAddLoginNotification: false,
      disableChangedPasswordNotification: false,
      neverDomains: {
        "example.com": null,
        "example2.com": null,
      },
    });

    expect(output["user1"]).toEqual({
      settings: { region: "Self-hosted" },
    });

    expect(output["user2"]).toEqual({
      settings: { region: "Self-hosted" },
    });
  });

  it("realistic browser who has two users, one account toggled the setting to the original value and one didn't touch the value, should have it be disabled.", async () => {
    const testInput: TestState = {
      authenticatedAccounts: ["user1", "user2"],
      global: {
        theme: "system", // A real global setting that should persist after migration
      },
      user1: {
        settings: {
          region: "Self-hosted",
        },
      },
      user2: {
        settings: {
          disableAddLoginNotification: false,
          disableChangedPasswordNotification: false,
          neverDomains: {
            "example.com": null,
          },
          region: "Self-hosted",
        },
      },
    };

    const output = await runMigrator(myMigrator, testInput);

    // The false settings should be respected over the true values
    // neverDomains should be combined into a single object
    expect(output["global"]).toEqual({
      theme: "system",
      disableAddLoginNotification: false,
      disableChangedPasswordNotification: false,
      neverDomains: {
        "example.com": null,
      },
    });

    expect(output["user1"]).toEqual({
      settings: { region: "Self-hosted" },
    });

    expect(output["user2"]).toEqual({
      settings: { region: "Self-hosted" },
    });
  });
});
