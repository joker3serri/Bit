/* eslint-disable*/
import TestIPC from "./test-ipc";
import * as config from "./variables";
import { NodeCryptoFunctionService } from "@bitwarden/node/services/nodeCryptoFunction.service";
import { ConsoleLogService } from "@bitwarden/common/services/consoleLog.service";
import { EncryptService } from "@bitwarden/common/services/encrypt.service";
import { CryptoService } from "@bitwarden/common/services/crypto.service";

import { Utils } from "@bitwarden/common/misc/utils";
import { EncString } from "@bitwarden/common/models/domain/encString";
import { EncryptionType } from "@bitwarden/common/enums/encryptionType";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";

let ipc = new TestIPC();
let encryptedCommand = {};
const status = () => {
  console.log(encryptedCommand);
  const message = {
    encryptedCommand: encryptedCommand,
    messageId: "status-message-id",
    version: 1,
  };

  ipc.sendEncryptedCommandV1(message);
};

const handshake = () => {
  const message = {
    appId: "native-messaging-test-running",
    command: "bw-handshake",
    payload: {
      publicKey: config.testRsaPublicKey,
    },
    messageId: "handshake-continue-message-id",
    version: 1.0,
  };

  ipc.sendUnencryptedCommandV1(message);
};

(async () => {
  await ipc.connect();
  await handshake();

  const nodeCryptoFunctionService = new NodeCryptoFunctionService();
  const logService = new ConsoleLogService(false);
  const encryptService = new EncryptService(nodeCryptoFunctionService, logService, false);

  const pubKey = Utils.fromB64ToArray(config.testRsaPublicKey);
  const value = JSON.stringify({ command: "bw-status" });
  const data = Utils.fromUtf8ToArray(value);
  const encBytes = await nodeCryptoFunctionService.rsaEncrypt(data.buffer, pubKey.buffer, "sha1");
  console.log(ipc.sharedKey);

  var t = await encryptService.encrypt(value, ipc.sharedKey);

  // const encBytes = await this.cryptoFunctionService.rsaEncrypt(data, publicKey, "sha1");
  encryptedCommand = t;
  console.log(t);

  //status();
})();
