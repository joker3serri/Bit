export abstract class VaultTimeoutService {
  checkVaultTimeout: () => Promise<void>;
}
