/* eslint-disable */
import { OuterMessageDecrypted } from "../src/services/nativeMessageHandler.service";

import TestIPC from "./test-ipc";

const data = require("./variables.json");

const ipc = new TestIPC();

const message = {
  appId: "native-messaging-test-running",
  command: "bw-handshake",
  payload: {
    publicKey: data.testPublicKey,
  },
  messageId: "handshake-message-id",
  version: 1.0,
} as OuterMessageDecrypted;

const handshake = () => {
  ipc.sendUnencryptedCommandV1(message);
};

(async () => {
  await ipc.connect();
  handshake();
})();
