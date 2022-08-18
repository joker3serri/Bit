import { EncString } from "@bitwarden/common/models/domain/encString";

import { MessageCommon } from "./MessageCommon";

export type EncryptedMessageResponse = MessageCommon & {
  encryptedPayload: EncString;
};
