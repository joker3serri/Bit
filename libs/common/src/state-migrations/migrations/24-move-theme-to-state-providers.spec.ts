import { runMigrator } from "../migration-helper.spec";

import { MoveThemeToStateProviderMigrator } from "./24-move-theme-to-state-providers";

describe("MoveThemeToStateProviders", () => {
  const sut = new MoveThemeToStateProviderMigrator(23, 24);

  describe("migrate", () => {
    it("migrates global theme and deletes it", async () => {
      const output = await runMigrator(sut, {
        global: {
          theme: "dark",
        },
      });

      expect(output).toEqual({
        global_theming_selection: "dark",
        global: {},
      });
    });

    it.each([{}, null])(
      "doesn't touch it if global state looks like: '%s'",
      async (globalState) => {
        const output = await runMigrator(sut, {
          global: globalState,
        });

        expect(output).toEqual({
          global: globalState,
        });
      },
    );
  });
});
