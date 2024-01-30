import { KeyDefinition, PASSKEYS_DISK } from "../../../platform/state";

export const USER_ENABLE_PASSKEYS = new KeyDefinition<boolean>(PASSKEYS_DISK, "enablePasskeys", {
  deserializer: (obj) => obj,
});
