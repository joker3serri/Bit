import { concatMap, zip, map, firstValueFrom } from "rxjs";

import { PolicyService } from "../../admin-console/abstractions/policy/policy.service.abstraction";
import { PasswordGeneratorPolicyOptions } from "../../admin-console/models/domain/password-generator-policy-options";
import { AccountService } from "../../auth/abstractions/account.service";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { StateProvider } from "../../platform/state";

import { GeneratorService } from "./abstractions";
import { PasswordGenerationServiceAbstraction } from "./abstractions/password-generation.service.abstraction";
import { DefaultGeneratorService } from "./default-generator.service";
import { DefaultGeneratorOptions } from "./generator-options";
import { GENERATOR_SETTINGS } from "./key-definitions";
import {
  DefaultPassphraseGenerationOptions,
  PassphraseGenerationOptions,
  PassphraseGeneratorPolicy,
  PassphraseGeneratorStrategy,
} from "./passphrase";
import {
  DefaultPasswordGenerationOptions,
  PasswordGenerationOptions,
  PasswordGenerationService,
  PasswordGeneratorOptions,
  PasswordGeneratorPolicy,
  PasswordGeneratorStrategy,
} from "./password";

/** Adapts the generator 2.0 design to 1.0 angular services. */
export class LegacyPasswordGenerationService implements PasswordGenerationServiceAbstraction {
  constructor(
    cryptoService: CryptoService,
    policyService: PolicyService,
    private readonly accountService: AccountService,
    private readonly stateProvider: StateProvider,
  ) {
    // FIXME: Once the password generation service is replaced with this service
    // in the clients, factor out the deprecated service in its entirety.
    const deprecatedService = new PasswordGenerationService(cryptoService, null, null);

    this.passwords = new DefaultGeneratorService(
      new PasswordGeneratorStrategy(deprecatedService, stateProvider),
      policyService,
    );

    this.passphrases = new DefaultGeneratorService(
      new PassphraseGeneratorStrategy(deprecatedService, stateProvider),
      policyService,
    );
  }

  private passwords: GeneratorService<PasswordGenerationOptions, PasswordGeneratorPolicy>;
  private passphrases: GeneratorService<PassphraseGenerationOptions, PassphraseGeneratorPolicy>;

  generatePassword(options: PasswordGeneratorOptions) {
    if (options.type === "password") {
      return this.passwords.generate(options);
    } else {
      return this.passphrases.generate(options);
    }
  }

  generatePassphrase(options: PasswordGeneratorOptions) {
    return this.passphrases.generate(options);
  }

  async getOptions() {
    const options$ = this.accountService.activeAccount$.pipe(
      concatMap((activeUser) =>
        zip(
          this.passwords.options$(activeUser.id),
          this.passphrases.options$(activeUser.id),
          this.passwords.evaluator$(activeUser.id),
          this.passphrases.evaluator$(activeUser.id),
          this.stateProvider.getUserState$(GENERATOR_SETTINGS, activeUser.id),
        ),
      ),
      map(
        ([
          passwordOptions,
          passphraseOptions,
          passwordEvaluator,
          passphraseEvaluator,
          generatorOptions,
        ]) => {
          const options: PasswordGeneratorOptions = Object.assign(
            {},
            passwordOptions ?? DefaultPasswordGenerationOptions,
            passphraseOptions ?? DefaultPassphraseGenerationOptions,
            generatorOptions ?? DefaultGeneratorOptions,
          );

          const policy = Object.assign(
            new PasswordGeneratorPolicyOptions(),
            passwordEvaluator.policy,
            passphraseEvaluator.policy,
          );

          return [options, policy] as [PasswordGenerationOptions, PasswordGeneratorPolicyOptions];
        },
      ),
    );

    const options = await firstValueFrom(options$);
    return options;
  }

  async enforcePasswordGeneratorPoliciesOnOptions(options: PasswordGeneratorOptions) {
    const options$ = this.accountService.activeAccount$.pipe(
      concatMap((activeUser) =>
        zip(this.passwords.evaluator$(activeUser.id), this.passphrases.evaluator$(activeUser.id)),
      ),
      map(([passwordEvaluator, passphraseEvaluator]) => {
        const policy = Object.assign(
          new PasswordGeneratorPolicyOptions(),
          passwordEvaluator.policy,
          passphraseEvaluator.policy,
        );

        if (options.type === "password") {
          return [passwordEvaluator.applyPolicy(options), policy];
        } else {
          return [passphraseEvaluator.applyPolicy(options), policy];
        }
      }),
    );

    const [sanitized, policy] = await firstValueFrom(options$);
    return [
      // callers assume this function updates the options parameter
      Object.assign(options, sanitized),
      policy,
    ] as [PasswordGenerationOptions, PasswordGeneratorPolicyOptions];
  }

  async saveOptions(options: PasswordGeneratorOptions) {
    const activeAccount = await firstValueFrom(this.accountService.activeAccount$);

    if (options.type === "password") {
      await this.passwords.saveOptions(activeAccount.id, options);
    } else {
      await this.passphrases.saveOptions(activeAccount.id, options);
    }
  }

  getHistory: () => Promise<any[]>;
  addHistory: (password: string) => Promise<void>;
  clear: (userId?: string) => Promise<void>;
}
