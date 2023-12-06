import { Utils } from "../misc/utils";

import { StateDefinition } from "./state-definition";
import * as stateDefinitionsRecord from "./state-definitions";

describe("state definitions", () => {
  it("has all unique state and follows naming guidelines", () => {
    const trackedNames: [string, string][] = [];
    Object.entries(stateDefinitionsRecord).forEach(([exportName, stateDefinition]) => {
      // All exports from state-definitions are expected to be StateDefinition's
      if (!(stateDefinition instanceof StateDefinition)) {
        throw new Error(`export ${exportName} is expected to be a StateDefinition`);
      }

      const fullName = `${stateDefinition.name}_${stateDefinition.storageLocation}`;

      const conflictingExport = trackedNames.find(([_, trackedName]) => trackedName === fullName);
      if (conflictingExport !== undefined) {
        const [conflictingExportName] = conflictingExport;
        throw new Error(
          `The export '${exportName}' has a conflicting state name and storage location with export ` +
            `'${conflictingExportName}' please ensure that you choose a unique name and location.`,
        );
      }

      const name = stateDefinition.name;

      if (Utils.isNullOrWhitespace(name)) {
        throw new Error("The state name cannot be null or only contain whitespace.");
      }

      if (name.includes(" ") || name.includes("_") || name[0].toLowerCase() !== name[0]) {
        throw new Error(
          `The state name '${name}' should begin with a lowercase value and not contain any spaces ` +
            "or '_' characters. The value should be in camelCase format.",
        );
      }

      trackedNames.push([exportName, fullName]);
    });
  });
});
