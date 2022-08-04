export abstract class SettingsService {
  getEquivalentDomains: () => Promise<any>;
  setEquivalentDomains: (equivalentDomains: string[][]) => Promise<any>;
  clear: (userId?: string) => Promise<void>;
}
