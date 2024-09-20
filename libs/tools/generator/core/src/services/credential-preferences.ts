import { GENERATOR_DISK, UserKeyDefinition } from "@bitwarden/common/platform/state";

import { CredentialPreference } from "../types";

/** plaintext password generation options */
export const PREFERENCES = new UserKeyDefinition<CredentialPreference>(
  GENERATOR_DISK,
  "credentialPreferences",
  {
    deserializer: (value) => {
      // transmute type of `updated` fields
      const result = value as any;
      result.password.updated = new Date(result.password.updated);
      result.email.updated = new Date(result.email.updated);
      result.username.updated = new Date(result.username.updated);
      return result;
    },
    clearOn: [],
  },
);
