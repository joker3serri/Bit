import { Jsonify } from "type-fest";

import { InitializerMetadata } from "../../interfaces/initializer-metadata.interface";
import { CipherView } from "../../models/view/cipher.view";
import { Cipher } from "../../vault/models/domain/cipher";

import { InitializerKey } from "./initializer-key";

/**
 * Internal reference of classes so we can reconstruct objects properly.
 * Each entry should be keyed using the Decryptable.initializerKey property
 */
const classInitializers: Record<InitializerKey, (obj: any) => any> = {
  [InitializerKey.Cipher]: Cipher.fromJSON,
  [InitializerKey.CipherView]: CipherView.fromJSON,
};

export function getClassInitializer<T extends InitializerMetadata>(
  className: InitializerKey
): (obj: Jsonify<T>) => T {
  return classInitializers[className];
}
