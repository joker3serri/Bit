import { GENERATOR_DISK, UserKeyDefinition } from "@bitwarden/common/platform/state";

import {
  PassphraseGenerationOptions,
  PasswordGenerationOptions,
  CatchallGenerationOptions,
  EffUsernameGenerationOptions,
  SubaddressGenerationOptions,
} from "../types";
import { RsaSshKeyGenerationOptions as RsaSshKeyGenerationOptions } from "../types/sshkey-generation-options";

/** plaintext password generation options */
export const PASSWORD_SETTINGS = new UserKeyDefinition<PasswordGenerationOptions>(
  GENERATOR_DISK,
  "passwordGeneratorSettings",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** plaintext passphrase generation options */
export const PASSPHRASE_SETTINGS = new UserKeyDefinition<PassphraseGenerationOptions>(
  GENERATOR_DISK,
  "passphraseGeneratorSettings",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** plaintext username generation options */
export const EFF_USERNAME_SETTINGS = new UserKeyDefinition<EffUsernameGenerationOptions>(
  GENERATOR_DISK,
  "effUsernameGeneratorSettings",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** plaintext configuration for a domain catch-all address. */
export const CATCHALL_SETTINGS = new UserKeyDefinition<CatchallGenerationOptions>(
  GENERATOR_DISK,
  "catchallGeneratorSettings",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** plaintext configuration for an email subaddress. */
export const SUBADDRESS_SETTINGS = new UserKeyDefinition<SubaddressGenerationOptions>(
  GENERATOR_DISK,
  "subaddressGeneratorSettings",
  {
    deserializer: (value) => value,
    clearOn: [],
  },
);

/** plaintext configuration for an ssh key. */
export const ED25519_SSHKEY_SETTINGS = new UserKeyDefinition<Record<string, never>>(
  GENERATOR_DISK,
  "sshkeyEd25519GeneratorSettings",
  {
    deserializer: (value) => value,
    clearOn: ["logout"],
  },
);

/** plaintext configuration for an ssh key. */
export const RSA_SSHKEY_SETTINGS = new UserKeyDefinition<RsaSshKeyGenerationOptions>(
  GENERATOR_DISK,
  "sshkeyRsaGeneratorSettings",
  {
    deserializer: (value) => value,
    clearOn: ["logout"],
  },
);
