import { MessageCommon } from "./MessageCommon";
import { UnencryptedCommand } from "./UnencryptedCommand";

export type UnencryptedMessage = MessageCommon & {
  command: UnencryptedCommand;
  payload: {
    publicKey: string;
  };
};
