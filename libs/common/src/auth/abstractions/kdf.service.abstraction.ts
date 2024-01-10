import { Observable } from "rxjs";

import { KdfType } from "../../platform/enums";
import { KdfConfig } from "../models/domain/kdf-config";

export abstract class KdfServiceAbstraction {
  kdfConfig$: Observable<KdfConfig>;
  kdfType$: Observable<KdfType>;

  setKdfConfig: (kdfConfig: KdfConfig) => Promise<void>;
  setKdfType: (kdfType: KdfType) => Promise<void>;
}
