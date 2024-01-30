import { FIDO2_DISK, KeyDefinition } from "../../../platform/state";

export const USER_ENABLE_PASSKEYS = new KeyDefinition<boolean>(FIDO2_DISK, "enablePasskeys", {
  deserializer: (obj) => obj,
});
