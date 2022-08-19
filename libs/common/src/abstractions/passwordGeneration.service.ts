import { Observable } from "rxjs";
import * as zxcvbn from "zxcvbn";

import { GeneratedPasswordHistory } from "../models/domain/generatedPasswordHistory";
import { PasswordGeneratorPolicyOptions } from "../models/domain/passwordGeneratorPolicyOptions";

export abstract class PasswordGenerationService {
  generatePassword: (options: any) => Promise<string>;
  generatePassphrase: (options: any) => Promise<string>;
  getOptions$: () => Observable<[any, PasswordGeneratorPolicyOptions]>;
  enforcePasswordGeneratorPoliciesOnOptions$: (
    options: any
  ) => Observable<[any, PasswordGeneratorPolicyOptions]>;
  getPasswordGeneratorPolicyOptions$: () => Observable<PasswordGeneratorPolicyOptions>;
  saveOptions: (options: any) => Promise<any>;
  getHistory: () => Promise<GeneratedPasswordHistory[]>;
  addHistory: (password: string) => Promise<any>;
  clear: (userId?: string) => Promise<any>;
  passwordStrength: (password: string, userInputs?: string[]) => zxcvbn.ZXCVBNResult;
  normalizeOptions: (options: any, enforcedPolicyOptions: PasswordGeneratorPolicyOptions) => void;
}
