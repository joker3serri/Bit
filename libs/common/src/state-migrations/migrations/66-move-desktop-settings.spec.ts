import { runMigrator } from "../migration-helper.spec";

import { MoveDesktopSettingsMigrator } from "./66-move-desktop-settings";

describe("MoveDesktopSettings", () => {
  const sut = new MoveDesktopSettingsMigrator(62, 63);

  const cases: {
    it: string;
    preMigration: Record<string, unknown>;
    postMigration: Record<string, unknown>;
  }[] = [
    {
      it: "moves truthy values",
      preMigration: {
        global_account_accounts: {
          user1: {},
          otherUser: {},
        },
        user1: {
          settings: {
            minimizeOnCopyToClipboard: true,
          },
        },
        otherUser: {
          settings: {
            random: "stuff",
          },
        },
        global: {
          enableBrowserIntegration: true,
        },
      },
      postMigration: {
        global_account_accounts: {
          user1: {},
          otherUser: {},
        },
        global: {},
        user1: {
          settings: {},
        },
        otherUser: {
          settings: {
            random: "stuff",
          },
        },
        global_desktopSettings_browserIntegrationEnabled: true,
        user_user1_desktopSettings_minimizeOnCopy: true,
      },
    },
    {
      it: "moves falsey values",
      preMigration: {
        global_account_accounts: {
          user1: {},
          otherUser: {},
        },
        user1: {
          settings: {
            minimizeOnCopyToClipboard: false,
          },
        },
        otherUser: {
          settings: {
            random: "stuff",
          },
        },
        global: {
          enableBrowserIntegration: false,
        },
      },
      postMigration: {
        global_account_accounts: {
          user1: {},
          otherUser: {},
        },
        global: {},
        user1: {
          settings: {},
        },
        otherUser: {
          settings: {
            random: "stuff",
          },
        },
        global_desktopSettings_browserIntegrationEnabled: false,
        user_user1_desktopSettings_minimizeOnCopy: false,
      },
    },
    {
      it: "does not move non-existant values",
      preMigration: {
        global_account_accounts: {
          user1: {},
          otherUser: {},
        },
        user1: {
          settings: {},
        },
        otherUser: {
          settings: {
            random: "stuff",
          },
        },
        global: {},
      },
      postMigration: {
        global_account_accounts: {
          user1: {},
          otherUser: {},
        },
        global: {},
        user1: {
          settings: {},
        },
        otherUser: {
          settings: {
            random: "stuff",
          },
        },
      },
    },
  ];

  describe("migrate", () => {
    it.each(cases)("$it", async ({ preMigration, postMigration }) => {
      const actualOutput = await runMigrator(sut, preMigration, "migrate");
      expect(actualOutput).toEqual(postMigration);
    });
  });

  describe("rollback", () => {
    it.each(cases)("$it", async ({ postMigration, preMigration }) => {
      const actualOutput = await runMigrator(sut, postMigration, "rollback");
      expect(actualOutput).toEqual(preMigration);
    });
  });
});
