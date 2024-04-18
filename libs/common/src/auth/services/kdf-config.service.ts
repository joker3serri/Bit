import { firstValueFrom } from "rxjs";

import { KdfType } from "../../platform/enums/kdf-type.enum";
import {
  ActiveUserState,
  KDF_CONFIG_DISK,
  StateProvider,
  UserKeyDefinition,
} from "../../platform/state";
import { KdfConfigService as KdfConfigServiceAbstraction } from "../abstractions/kdf-config.service";
import { Argon2KdfConfig, KdfConfig, PBKDF2KdfConfig } from "../models/domain/kdf-config";

export const KDF_CONFIG = new UserKeyDefinition<KdfConfig>(KDF_CONFIG_DISK, "kdfConfig", {
  deserializer: (kdfConfig: KdfConfig) => {
    if (kdfConfig == null) {
      return null;
    }
    return kdfConfig.kdfType === KdfType.PBKDF2_SHA256
      ? PBKDF2KdfConfig.fromJSON(kdfConfig)
      : Argon2KdfConfig.fromJSON(kdfConfig);
  },
  clearOn: ["logout"],
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
    const state = firstValueFrom(this.kdfConfigState.state$);
    if (state === null) {
      throw new Error("KdfConfig for active user account state is null");
    }
    return state;
  }
}
