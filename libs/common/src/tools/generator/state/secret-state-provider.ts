import { EncString } from "../../../platform/models/domain/enc-string";
import { StateProvider, KeyDefinition, DeriveDefinition } from "../../../platform/state";
import { UserId } from "../../../types/guid";

import { SecretState } from "./secret-state";
import { UserKeyEncryptor } from "./user-key-encryptor";

export class SecretStateProvider {
  constructor(private provider: StateProvider) {}

  getSecret<TFrom extends object, Exposed, Secret>(
    userId: UserId,
    key: KeyDefinition<TFrom>,
    encryptor: UserKeyEncryptor<TFrom, Exposed, Secret>,
  ) {
    type ClassifiedFormat = { secret: string; public: Exposed };

    const secretKey = new KeyDefinition<ClassifiedFormat>(key.stateDefinition, key.key, {
      cleanupDelayMs: key.cleanupDelayMs,
      // `ClassifiedFormat` uses a type assertion to avoid a wild
      // type assertion guaranteeing `Exposed` is stringify-able
      deserializer: (jsonValue) => jsonValue as ClassifiedFormat,
    });

    const deriveDefinition = DeriveDefinition.from<ClassifiedFormat, TFrom>(secretKey, {
      derive: async (from) => {
        const secret = EncString.fromJSON(from.secret);
        const decrypted = await encryptor.decrypt(secret, from.public);
        const value = key.deserializer(decrypted);
        return value;
      },
      deserializer: key.deserializer,
      cleanupDelayMs: key.cleanupDelayMs,
    });

    const secretStore = this.provider.getUser(userId, secretKey);
    const plaintextState = this.provider.getDerived(secretStore.state$, deriveDefinition, null);

    const secretState = new SecretState(encryptor, secretStore, plaintextState);

    return secretState;
  }
}
