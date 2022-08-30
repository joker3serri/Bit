export abstract class VaultTimeoutActionService {
  lock: (userId?: string) => Promise<void>;
  logOut: (userId?: string) => Promise<void>;
}
