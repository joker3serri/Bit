import { Policy as AdminPolicy } from "@bitwarden/common/admin-console/models/domain/policy";

import { PassphraseGeneratorOptionsEvaluator, PassphraseGeneratorPolicy } from "./passphrase";
import {
  DisabledPassphraseGeneratorPolicy,
  leastPrivilege as passphraseLeastPrivilege,
} from "./passphrase/passphrase-generator-policy";
import { PasswordGeneratorOptionsEvaluator, PasswordGeneratorPolicy } from "./password";
import {
  DisabledPasswordGeneratorPolicy,
  leastPrivilege as passwordLeastPrivilege,
} from "./password/password-generator-policy";

export type PolicyMetadata<Policy, Evaluator> = {
  disabledValue: Policy;
  combine: (acc: Policy, policy: AdminPolicy) => Policy;
  createEvaluator: (policy: Policy) => Evaluator;
};

const PASSPHRASE = Object.freeze({
  disabledValue: DisabledPassphraseGeneratorPolicy,
  combine: passphraseLeastPrivilege,
  createEvaluator: (policy) => new PassphraseGeneratorOptionsEvaluator(policy),
} as PolicyMetadata<PassphraseGeneratorPolicy, PassphraseGeneratorOptionsEvaluator>);

const PASSWORD = Object.freeze({
  disabledValue: DisabledPasswordGeneratorPolicy,
  combine: passwordLeastPrivilege,
  createEvaluator: (policy) => new PasswordGeneratorOptionsEvaluator(policy),
} as PolicyMetadata<PasswordGeneratorPolicy, PasswordGeneratorOptionsEvaluator>);

export const Policies = Object.freeze({
  Passphrase: PASSPHRASE,
  Password: PASSWORD,
});
