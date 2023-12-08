import { StateDefinition } from "./state-definition";
import * as stateDefinitionsRecord from "./state-definitions";

describe("state definitions", () => {
  const trackedNames: [string, string][] = [];

  test.each(Object.entries(stateDefinitionsRecord))(
    "that export %s follows all rules",
    (exportName, stateDefinition) => {
      // All exports from state-definitions are expected to be StateDefinition's
      if (!(stateDefinition instanceof StateDefinition)) {
        throw new Error(`export ${exportName} is expected to be a StateDefinition`);
      }

      const fullName = `${stateDefinition.name}_${stateDefinition.storageLocation}`;

      const exactConflictingExport = trackedNames.find(
        ([_, trackedName]) => trackedName === fullName,
      );
      if (exactConflictingExport !== undefined) {
        const [conflictingExportName] = exactConflictingExport;
        throw new Error(
          `The export '${exportName}' has a conflicting state name and storage location with export ` +
            `'${conflictingExportName}' please ensure that you choose a unique name and location.`,
        );
      }

      const roughConflictingExport = trackedNames.find(
        ([_, trackedName]) => trackedName.toLowerCase() === fullName.toLowerCase(),
      );
      if (roughConflictingExport !== undefined) {
        const [conflictingExportName] = roughConflictingExport;
        throw new Error(
          `The export '${exportName}' differs its state name and storage location ` +
            `only by casing with export '${conflictingExportName}' please ensure it differs by more than casing.`,
        );
      }

      const name = stateDefinition.name;

      expect(name).not.toBeUndefined(); // undefined in an invalid name
      expect(name).not.toBeNull(); // null is in invalid name
      expect(name.length).toBeGreaterThan(3); // A 3 characters or less name is not descriptive enough
      expect(name[0]).toEqual(name[0].toLowerCase()); // First character should be lower case since camelCase is required
      expect(name).not.toContain(" "); // There should be no spaces in a state name
      expect(name).not.toContain("_"); // We should not be doing snake_case for state name

      // TODO: Should we expect any details about the export name?

      trackedNames.push([exportName, fullName]);
    },
  );
});
