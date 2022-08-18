import { EncryptedCommand } from "./EncryptedCommand";

export type DecryptedCommandData = {
  command: EncryptedCommand;
  payload?: any;
};
