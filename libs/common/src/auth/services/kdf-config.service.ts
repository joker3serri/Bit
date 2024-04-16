import { firstValueFrom } from "rxjs";

import {
  ActiveUserState,
  KDF_CONFIG_DISK,
  StateProvider,
  UserKeyDefinition,
} from "../../platform/state";
import { KdfConfigService as KdfConfigServiceAbstraction } from "../abstractions/kdf-config.service";
import { KdfConfig } from "../models/domain/kdf-config";

export const KDF_CONFIG = new UserKeyDefinition<KdfConfig>(KDF_CONFIG_DISK, "kdfConfig", {
  deserializer: (kdfConfig: KdfConfig) => kdfConfig,
  clearOn: [],
});

export class KdfConfigService implements KdfConfigServiceAbstraction {
  private kdfConfigState: ActiveUserState<KdfConfig>;
  constructor(private stateProvider: StateProvider) {
    this.kdfConfigState = this.stateProvider.getActive(KDF_CONFIG);
  }

  async setKdfConfig(kdfConfig: KdfConfig) {
    await this.kdfConfigState.update(() => kdfConfig);
  }

  getKdfConfig(): Promise<KdfConfig> {
    return firstValueFrom(this.kdfConfigState.state$);
  }
}
