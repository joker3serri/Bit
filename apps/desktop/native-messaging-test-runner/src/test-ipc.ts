// /* eslint-disable no-console */

// import "module-alias/register";
// import { homedir } from "os";
// import { Utils } from "@bitwarden/common/misc/utils";
// import { SymmetricCryptoKey } from "@bitwarden/common/models/domain/symmetricCryptoKey";
// import { ConsoleLogService } from "@bitwarden/common/services/consoleLog.service";
// import { EncryptService } from "@bitwarden/common/services/encrypt.service";
// import { NodeCryptoFunctionService } from "@bitwarden/node/services/nodeCryptoFunction.service";
// import * as config from "./variables";

// const ipc = require("node-ipc").default;

// const fs = require("fs");

// ipc.config.id = "native-messaging-test-runner";
// ipc.config.retry = 1500;
// ipc.config.silent = false;
// ipc.config.logger = () => {}; // Passes empty function as logger. It is fairly verbose and clutters the output

// export default class TestIPC {
//   private desktopAppPath = homedir + "/tmp/app.bitwarden";
//   public sharedKey: SymmetricCryptoKey;
//   public completedHandshake = false;

//   async connect() {
//     return new Promise((resolve) => {
//       ipc.connectTo("bitwarden", this.desktopAppPath, () => {
//         ipc.of.bitwarden.on("message", async (message: any) => {
//           await this.handleResponse(message);
//         });

//         ipc.of.bitwarden.on("error", (err: any) => {
//           console.error("error", err);
//           console.log("\x1b[33m Please make sure the desktop app is running locally \x1b[0m");
//         });

//         ipc.of.bitwarden.on("disconnect", () => {
//           console.log("disconnected from desktop app");
//           this.disconnect();
//         });

//         resolve(null);
//       });
//     });
//   }

//   disconnect() {
//     ipc.disconnect("bitwarden");
//   }

//   emitEvent = (event: string, payload: any) => {
//     ipc.of.bitwarden.emit(event, payload);
//   };

//   // Exisitng commands
//   sendCommandLegacy = (command: string, data: any) => {
//     console.log(`sending command: ${command}`);
//     this.emitEvent("message", {
//       appId: "native-messaging-test-runner",
//       message: {
//         ...data,
//         command,
//       },
//     });
//   };

//   // Handshake command should be the only one using this
//   sendUnencryptedCommandV1(message: any): void {
//     console.log(`sending command: ${message.command}`);
//     this.emitEvent("message", message);
//   }

//   sendEncryptedCommandV1 = (message: any) => {
//     console.log("sending command encrypted command");
//     this.emitEvent("message", message);
//   };

//   async handleResponse(message: any) {
//     let knownMessage = false;
//     switch (message.messageId) {
//       case "handshake-message-id":
//         knownMessage = true;
//         await this.handleHandshakeResponse(message);
//         this.disconnect();
//         break;
//       case "handshake-continue-message-id":
//         knownMessage = true;
//         await this.handleHandshakeResponse(message);
//         break;
//       case "status-message-id":
//         knownMessage = true;
//         await this.handleStatusRespone(message);
//         break;
//     }

//     if (message.status === "canceled") {
//       console.log("\x1b[33m Connected to Desktop app, but operation was canceled. \x1b[0m");
//       console.log(
//         "\x1b[33m Make sure 'Allow DuckDuckGo browser integration' setting is enabled. \x1b[0m"
//       );
//       this.disconnect();
//     } else if (!knownMessage) {
//       console.log("Received some other message: ", message);
//     }
//     //this.disconnect();
//   }

//   async handleHandshakeResponse(message: any) {
//     console.log("\x1b[32m Received response to handshake request \x1b[0m");
//     if (message.payload.sharedKey) {
//       console.log("\x1b[32m Handshake has shared key \x1b[0m");

//       const nodeCryptoFunctionService = new NodeCryptoFunctionService();
//       const privKey = Utils.fromB64ToArray(config.testRsaPrivateKey).buffer;
//       const dataBuffer = Utils.fromB64ToArray(message.payload.sharedKey).buffer;
//       try {
//         var sharedKey = await nodeCryptoFunctionService.rsaDecrypt(dataBuffer, privKey, "sha1");
//         this.sharedKey = new SymmetricCryptoKey(sharedKey);

//         // const logService = new ConsoleLogService(false);
//         // const encryptService = new EncryptService(nodeCryptoFunctionService, logService, false);

//         // const pubKey = Utils.fromB64ToArray(config.testRsaPublicKey);
//         // const value = JSON.stringify({ command: "bw-status" });
//         // const data = Utils.fromUtf8ToArray(value);
//         // const encBytes = await nodeCryptoFunctionService.rsaEncrypt(
//         //   data.buffer,
//         //   pubKey.buffer,
//         //   "sha1"
//         // );
//         // console.log(this.sharedKey);

//         // var t = await encryptService.encrypt(value, this.sharedKey);

//         // const encBytes = await this.cryptoFunctionService.rsaEncrypt(data, publicKey, "sha1");
//         // let encryptedCommand = t;
//         // console.log(t);
//         this.completedHandshake = true;
//         console.log("\x1b[32m Shared key is decryptable \x1b[0m");
//       } catch (Exception) {
//         console.log("\x1b[31m Error decrypting shared key \x1b[0m");
//       }
//     }
//     if (message.payload.status === "success") {
//       console.log("\x1b[32m Handshake success response \x1b[0m");
//     } else if (message.status === "failure") {
//       console.log("\x1b[31m Handshake failure response \x1b[0m");
//     }
//   }

//   async handleStatusRespone(message: any) {
//     console.log("\x1b[32m Received response to status request \x1b[0m");
//     this.disconnect();
//   }
// }
