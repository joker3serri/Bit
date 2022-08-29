import { Observable } from "rxjs";

import { AccountSettings } from "../models/domain/account";

export abstract class SettingsService {
  settings$: Observable<AccountSettings[]>;

  equivalentDomains$: () => Observable<any>;
  setEquivalentDomains: (equivalentDomains: string[][]) => Promise<any>;
  clear: (userId?: string) => Promise<void>;
}
