import { KdfType } from "../../platform/enums";
import {
  ActiveUserState,
  ActiveUserStateProvider,
  KDF_DISK,
  KeyDefinition,
} from "../../platform/state";
import { KdfServiceAbstraction } from "../abstractions/kdf.service.abstraction";
import { KdfConfig } from "../models/domain/kdf-config";

// TODO: Check if this can be memory
const KDF_CONFIG = new KeyDefinition<KdfConfig>(KDF_DISK, "kdfConfig", {
  deserializer: (config) => new KdfConfig(config.iterations, config.memory, config.parallelism),
});

const KDF_TYPE = new KeyDefinition<KdfType>(KDF_DISK, "kdfType", {
  deserializer: (type) => type,
});

export class KdfService implements KdfServiceAbstraction {
  private kdfConfigState: ActiveUserState<KdfConfig>;
  private kdfTypeState: ActiveUserState<KdfType>;

  kdfConfig$;
  kdfType$;

  constructor(private stateProvider: ActiveUserStateProvider) {
    this.kdfConfigState = this.stateProvider.get(KDF_CONFIG);
    this.kdfTypeState = this.stateProvider.get(KDF_TYPE);

    this.kdfConfig$ = this.kdfConfigState.state$;
    this.kdfType$ = this.kdfTypeState.state$;
  }

  async setKdfConfig(kdfConfig: KdfConfig): Promise<void> {
    await this.kdfConfigState.update((_) => kdfConfig);
  }

  async setKdfType(kdfType: KdfType): Promise<void> {
    await this.kdfTypeState.update((_) => kdfType);
  }
}
