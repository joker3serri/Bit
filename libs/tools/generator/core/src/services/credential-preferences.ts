import { GENERATOR_DISK, UserKeyDefinition } from "@bitwarden/common/platform/state";

import { CredentialPreference } from "../types";

/** plaintext password generation options */
export const PREFERENCES = new UserKeyDefinition<CredentialPreference>(
  GENERATOR_DISK,
  "credentialPreferences",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);
