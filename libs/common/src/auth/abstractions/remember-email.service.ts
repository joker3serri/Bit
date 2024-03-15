export abstract class RememberEmailService {
  getEmail: () => string;
  getRememberEmail: () => boolean;
  setEmail: (value: string) => void;
  setRememberEmail: (value: boolean) => void;
  clearValues: () => void;
  getStoredEmail: () => Promise<string>;
  setStoredEmail: (value: string) => Promise<void>;
  saveEmailSettings: () => Promise<void>;
}
