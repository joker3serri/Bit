// @ts-strict-ignore
export abstract class PasswordRepromptService {
  protectedFields: () => string[];
  showPasswordPrompt: () => Promise<boolean>;
  enabled: () => Promise<boolean>;
}
