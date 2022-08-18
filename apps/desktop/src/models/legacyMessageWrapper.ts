import { EncString } from "@bitwarden/common/models/domain/encString";

import { LegacyMessage } from "./LegacyMessage";

export type LegacyMessageWrapper = {
  message: LegacyMessage | EncString;
  appId: string;
};
