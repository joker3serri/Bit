export abstract class RememberEmailService {
  getEmail: () => string;
  getRememberEmail: () => boolean;
  setEmail: (value: string) => void;
  setRememberEmail: (value: boolean) => void;
  clearValues: () => void;
  getRememberedEmail: () => Promise<string>;
  setRememberedEmail: (value: string) => Promise<void>;
  saveEmailSettings: () => Promise<void>;
}
