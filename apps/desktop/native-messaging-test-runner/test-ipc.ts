/* eslint-disable */
import {
  LegacyOuterMessage,
  OuterMessageDecrypted,
  OuterMessageEncrypted,
} from "../src/services/nativeMessageHandler.service";

const ipc = require("node-ipc").default;

ipc.config.id = "native-messaging-test-runner";
ipc.config.retry = 1500;
ipc.config.silent = false;
ipc.config.logger = () => {}; // Passes empty function as logger. It is fairly verbose and clutters the output

export default class TestIPC {
  private homedir = require("os").homedir();
  private desktopAppPath = this.homedir + "/tmp/app.bitwarden";

  async connect() {
    return new Promise((resolve) => {
      ipc.connectTo("bitwarden", this.desktopAppPath, () => {
        ipc.of.bitwarden.on("message", (message: any) => {
          this.handleResponse(message);
        });

        ipc.of.bitwarden.on("error", (err: any) => {
          console.error("error", err);
          console.log("\x1b[33m Please make sure the desktop app is running locally \x1b[0m");
        });

        ipc.of.bitwarden.on("disconnect", () => {
          console.log("disconnected from desktop app");
          this.disconnect();
        });

        resolve(null);
      });
    });
  }

  disconnect() {
    ipc.disconnect("bitwarden");
  }

  emitEvent = (
    event: string,
    payload: OuterMessageDecrypted | OuterMessageEncrypted | LegacyOuterMessage
  ) => {
    ipc.of.bitwarden.emit(event, payload);
  };

  // Exisitng commands
  sendCommandLegacy = (command: string, data: any) => {
    console.log(`sending command: ${command}`);
    this.emitEvent("message", {
      appId: "native-messaging-test-runner",
      message: {
        ...data,
        command,
      },
    });
  };

  // Handshake command should be the only one using this
  sendUnencryptedCommandV1(message: OuterMessageDecrypted): void {
    console.log(`sending command: ${message.command}`);
    this.emitEvent("message", message);
  }

  sendEncryptedCommandV1 = (message: OuterMessageEncrypted) => {
    console.log(`sending command: ${message.encryptedCommand}`);
    this.emitEvent("message", message);
  };

  handleResponse(message: any) {
    if (message.messageId === "handshake-message-id") {
      if (message.status === "success") {
        console.log("\x1b[32m Handshake success response \x1b[0m");
      } else if (message.status === "failure") {
        console.log("\x1b[31m Handshake failure response \x1b[0m");
      }
      this.disconnect();
    } else if (message.status === "canceled") {
      console.log("\x1b[33m Connected to Desktop app, but operation was canceled. \x1b[0m");
      console.log(
        "\x1b[33m Make sure 'Allow DuckDuckGo browser integration' setting is enabled. \x1b[0m"
      );
      this.disconnect();
    } else {
      console.log("Received message: ", message);
    }
  }
}
