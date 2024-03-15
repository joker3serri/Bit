export abstract class EmailService {
  getEmail: () => string;
  setEmail: (value: string) => void;
  getRememberEmail: () => boolean;
  setRememberEmail: (value: boolean) => void;
  getStoredEmail: () => Promise<string>;
  setStoredEmail: (value: string) => Promise<void>;
  clearValues: () => void;
  saveEmailSettings: () => Promise<void>;
}
