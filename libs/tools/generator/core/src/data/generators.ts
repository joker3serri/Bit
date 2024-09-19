import { PolicyType } from "@bitwarden/common/admin-console/enums";
import { Policy } from "@bitwarden/common/admin-console/models/domain/policy";
import { IdentityConstraint } from "@bitwarden/common/tools/state/identity-state-constraint";

import { Randomizer } from "../abstractions";
import { EmailRandomizer, PasswordRandomizer, UsernameRandomizer } from "../engine";
import { DefaultPolicyEvaluator } from "../policies";
import {
  CATCHALL_SETTINGS,
  EFF_USERNAME_SETTINGS,
  PASSPHRASE_SETTINGS,
  PASSWORD_SETTINGS,
  SUBADDRESS_SETTINGS,
} from "../strategies/storage";
import {
  CatchallGenerationOptions,
  CredentialGenerator,
  EffUsernameGenerationOptions,
  NoPolicy,
  PassphraseGenerationOptions,
  PassphraseGeneratorPolicy,
  PasswordGenerationOptions,
  PasswordGeneratorPolicy,
  SubaddressGenerationOptions,
} from "../types";
import { CredentialGeneratorConfiguration } from "../types/credential-generator-configuration";

import { DefaultCatchallOptions } from "./default-catchall-options";
import { DefaultEffUsernameOptions } from "./default-eff-username-options";
import { DefaultPassphraseBoundaries } from "./default-passphrase-boundaries";
import { DefaultPassphraseGenerationOptions } from "./default-passphrase-generation-options";
import { DefaultPasswordBoundaries } from "./default-password-boundaries";
import { DefaultPasswordGenerationOptions } from "./default-password-generation-options";
import { DefaultSubaddressOptions } from "./default-subaddress-generator-options";
import { Policies } from "./policies";

const PASSPHRASE = Object.freeze({
  algorithm: "passphrase",
  engine: {
    create(randomizer: Randomizer): CredentialGenerator<PassphraseGenerationOptions> {
      return new PasswordRandomizer(randomizer);
    },
  },
  settings: {
    initial: DefaultPassphraseGenerationOptions,
    constraints: {
      numWords: {
        min: DefaultPassphraseBoundaries.numWords.min,
        max: DefaultPassphraseBoundaries.numWords.max,
      },
      wordSeparator: { maxLength: 1 },
    },
    account: PASSPHRASE_SETTINGS,
  },
  policy: Policies.Passphrase,
} satisfies CredentialGeneratorConfiguration<
  PassphraseGenerationOptions,
  PassphraseGeneratorPolicy
>);

const PASSWORD = Object.freeze({
  algorithm: "password",
  engine: {
    create(randomizer: Randomizer): CredentialGenerator<PasswordGenerationOptions> {
      return new PasswordRandomizer(randomizer);
    },
  },
  settings: {
    initial: DefaultPasswordGenerationOptions,
    constraints: {
      length: {
        min: DefaultPasswordBoundaries.length.min,
        max: DefaultPasswordBoundaries.length.max,
      },
      minNumber: {
        min: DefaultPasswordBoundaries.minDigits.min,
        max: DefaultPasswordBoundaries.minDigits.max,
      },
      minSpecial: {
        min: DefaultPasswordBoundaries.minSpecialCharacters.min,
        max: DefaultPasswordBoundaries.minSpecialCharacters.max,
      },
    },
    account: PASSWORD_SETTINGS,
  },
  policy: Policies.Password,
} satisfies CredentialGeneratorConfiguration<PasswordGenerationOptions, PasswordGeneratorPolicy>);

const USERNAME = Object.freeze({
  algorithm: "username",
  engine: {
    create(randomizer: Randomizer): CredentialGenerator<EffUsernameGenerationOptions> {
      return new UsernameRandomizer(randomizer);
    },
  },
  settings: {
    initial: DefaultEffUsernameOptions,
    constraints: {},
    account: EFF_USERNAME_SETTINGS,
  },
  policy: {
    type: PolicyType.PasswordGenerator,
    disabledValue: {},
    combine(_acc: NoPolicy, _policy: Policy) {
      return {};
    },
    createEvaluator(_policy: NoPolicy) {
      return new DefaultPolicyEvaluator<EffUsernameGenerationOptions>();
    },
    toConstraints(_policy: NoPolicy) {
      return new IdentityConstraint<EffUsernameGenerationOptions>();
    },
  },
} satisfies CredentialGeneratorConfiguration<EffUsernameGenerationOptions, NoPolicy>);

const CATCHALL = Object.freeze({
  algorithm: "catchall",
  engine: {
    create(randomizer: Randomizer): CredentialGenerator<CatchallGenerationOptions> {
      return new EmailRandomizer(randomizer);
    },
  },
  settings: {
    initial: DefaultCatchallOptions,
    constraints: { catchallDomain: { minLength: 1 } },
    account: CATCHALL_SETTINGS,
  },
  policy: {
    type: PolicyType.PasswordGenerator,
    disabledValue: {},
    combine(_acc: NoPolicy, _policy: Policy) {
      return {};
    },
    createEvaluator(_policy: NoPolicy) {
      return new DefaultPolicyEvaluator<CatchallGenerationOptions>();
    },
    toConstraints(_policy: NoPolicy) {
      return new IdentityConstraint<CatchallGenerationOptions>();
    },
  },
} satisfies CredentialGeneratorConfiguration<CatchallGenerationOptions, NoPolicy>);

const SUBADDRESS = Object.freeze({
  algorithm: "subaddress",
  engine: {
    create(randomizer: Randomizer): CredentialGenerator<SubaddressGenerationOptions> {
      return new EmailRandomizer(randomizer);
    },
  },
  settings: {
    initial: DefaultSubaddressOptions,
    constraints: {},
    account: SUBADDRESS_SETTINGS,
  },
  policy: {
    type: PolicyType.PasswordGenerator,
    disabledValue: {},
    combine(_acc: NoPolicy, _policy: Policy) {
      return {};
    },
    createEvaluator(_policy: NoPolicy) {
      return new DefaultPolicyEvaluator<SubaddressGenerationOptions>();
    },
    toConstraints(_policy: NoPolicy) {
      return new IdentityConstraint<SubaddressGenerationOptions>();
    },
  },
} satisfies CredentialGeneratorConfiguration<SubaddressGenerationOptions, NoPolicy>);

/** Generator configurations */
export const Generators = Object.freeze({
  /** Passphrase generator configuration */
  Passphrase: PASSPHRASE,

  /** Password generator configuration */
  Password: PASSWORD,

  /** Username generator configuration */
  Username: USERNAME,

  /** Catchall email generator configuration */
  Catchall: CATCHALL,

  /** Email subaddress generator configuration */
  Subaddress: SUBADDRESS,
});
