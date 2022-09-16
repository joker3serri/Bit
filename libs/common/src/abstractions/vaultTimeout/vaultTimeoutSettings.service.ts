export abstract class VaultTimeoutSettingsService {
  setVaultTimeoutOptions: (vaultTimeout: number, vaultTimeoutAction: string) => Promise<void>;
  getVaultTimeout: (userId?: string) => Promise<number>;
  setVaultTimeout: (timeout: number, userId?: string) => Promise<void>;
  isPinLockSet: () => Promise<[boolean, boolean]>;
  isBiometricLockSet: () => Promise<boolean>;
  clear: (userId?: string) => Promise<void>;
}
