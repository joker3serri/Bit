import { KeyDefinition, VAULT_FILTER_DISK } from "../../../platform/state";

import { CollapsedGroupingId } from "./../../../types/guid";

export const COLLAPSED_GROUPINGS = KeyDefinition.array<CollapsedGroupingId>(
  VAULT_FILTER_DISK,
  "collapsedGroupings",
  {
    deserializer: (obj) => obj,
  },
);
