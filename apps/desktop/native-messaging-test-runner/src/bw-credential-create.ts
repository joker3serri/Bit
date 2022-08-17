import "module-alias/register";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { LogUtils } from "./logUtils";
import NativeMessageService from "./nativeMessageService";
import * as config from "./variables";

const argv: any = yargs(hideBin(process.argv)).option("name", {
  alias: "n",
  demand: true,
  describe: "Name that the created login will be given",
  type: "string",
}).argv;

const { name } = argv;

(async () => {
  const nativeMessageService = new NativeMessageService(1.0);
  // Handshake
  LogUtils.logWarning("Sending Handshake");
  const handshakeResponse = await nativeMessageService.sendHandshake(config.testRsaPublicKey);

  if (handshakeResponse.status !== "success") {
    LogUtils.logError(" Handshake failed. Status was:", handshakeResponse.status);
    nativeMessageService.disconnect();
    return;
  }

  LogUtils.logSuccess("Handshake success response");
  const response = await nativeMessageService.credentialCreation(handshakeResponse.sharedKey, name);

  if (response.payload.status === "failure") {
    LogUtils.logError("Failure response returned ");
  } else if (response.payload.status === "success") {
    LogUtils.logSuccess("Success response returned ");
  } else {
    LogUtils.logWarning("Other response: ", response);
  }

  nativeMessageService.disconnect();
})();
