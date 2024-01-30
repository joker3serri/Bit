import { Observable } from "rxjs";

export abstract class VaultSettingsService {
  enablePasskeys$: Observable<boolean>;
  setEnablePasskeys: (value: boolean) => Promise<void>;
}
