import { PolicyType } from "../../../admin-console/enums";
import { Policy } from "../../../admin-console/models/domain/policy";
import { GeneratorStrategy } from "../abstractions";
import { DefaultPolicyEvaluator } from "../default-policy-evaluator";
import { EFF_LONG_WORD_SETTINGS } from "../key-definitions";
import { NoPolicy } from "../no-policy";

import { EffLongWordGenerationOptions } from "./eff-long-word-generator-options";
import { UsernameGenerationServiceAbstraction } from "./username-generation.service.abstraction";

const ONE_MINUTE = 60 * 1000;

/** Strategy for creating usernames from the EFF wordlist */
export class EffLongWordGeneratorStrategy
  implements GeneratorStrategy<EffLongWordGenerationOptions, NoPolicy>
{
  /** Instantiates the generation strategy
   *  @param usernameService generates a username from EFF word list
   */
  constructor(private usernameService: UsernameGenerationServiceAbstraction) {}

  /** {@link GeneratorStrategy.disk} */
  get disk() {
    return EFF_LONG_WORD_SETTINGS;
  }

  /** {@link GeneratorStrategy.policy} */
  get policy() {
    // Uses password generator since there aren't policies
    // specific to usernames.
    return PolicyType.PasswordGenerator;
  }

  /** {@link GeneratorStrategy.cache_ms} */
  get cache_ms() {
    return ONE_MINUTE;
  }

  /** {@link GeneratorStrategy.evaluator} */
  evaluator(policy: Policy) {
    if (policy.type !== this.policy) {
      const details = `Expected: ${this.policy}. Received: ${policy.type}`;
      throw Error("Mismatched policy type. " + details);
    }

    return new DefaultPolicyEvaluator<EffLongWordGenerationOptions>();
  }

  /** {@link GeneratorStrategy.generate} */
  generate(options: EffLongWordGenerationOptions) {
    return this.usernameService.generateWord(options);
  }
}
