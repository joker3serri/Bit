import { EncString } from "@bitwarden/common/models/domain/encString";

import { MessageCommon } from "./MessageCommon";

export type EncryptedMessage = MessageCommon & {
  // Will decrypt to a DecryptedCommandData object
  encryptedCommand: EncString;
};
