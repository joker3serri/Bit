import { EncString } from "@bitwarden/common/models/domain/encString";

export type LegacyMessage = {
  command: string;

  userId?: string;
  timestamp?: number;

  publicKey?: string;
};

export type LegacyMessageWrapper = {
  message: LegacyMessage | EncString;
  appId: string;
};

export type MessageCommon = {
  version: number;
  messageId: string;
};

type UnencryptedCommand = "bw-handshake";

type EncryptedCommand =
  | "bw-status"
  | "bw-credential-retrieval"
  | "bw-credential-create"
  | "bw-credential-update"
  | "bw-generate-password";

export type UnencryptedMessage = MessageCommon & {
  command: UnencryptedCommand;
  payload: {
    publicKey: string;
  };
};

export type DecryptedCommandData = {
  command: EncryptedCommand;
  payload?: any;
};

export type EncryptedMessage = MessageCommon & {
  // Will decrypt to a DecryptedCommandData object
  encryptedCommand: EncString;
};

export type UnencryptedMessageResponse = MessageCommon &
  (
    | {
        payload: {
          status: "cancelled";
        };
      }
    | {
        payload: {
          status: "success";
          sharedKey: string;
        };
      }
    | {
        payload: {
          error: "locked" | "cannot-decrypt";
        };
      }
  );

export type EncryptedMessageResponse = MessageCommon & {
  encryptedPayload: EncString;
};

export type Message = UnencryptedMessage | EncryptedMessage;

export type CipherCreatePayload = {
  userId: string;
  userName: string;
  password: string;
  name: string;
  uri: string;
};

export type CipherResponse = {
  userId: string;
  credentialId: string;
  userName: string;
  password: string;
  name: string;
};
