import "module-alias/register";

import yargs from "yargs";
import { hideBin } from "yargs/helpers";

import { LogUtils } from "./logUtils";
import NativeMessageService from "./nativeMessageService";
import * as config from "./variables";

// Command line arguments
const argv: any = yargs(hideBin(process.argv))
  .option("name", {
    alias: "n",
    demand: true,
    describe: "Name that the updated login will be given",
    type: "string",
  })
  .option("username", {
    alias: "u",
    demand: true,
    describe: "Username that the login will be given",
    type: "string",
  })
  .option("password", {
    alias: "p",
    demand: true,
    describe: "Password that the login will be given",
    type: "string",
  })
  .option("uri", {
    demand: true,
    describe: "Uri that the login will be given",
    type: "string",
  }).argv;

const { name, username, password, uri } = argv;

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

  // Get active account userId
  const status = await nativeMessageService.checkStatus(handshakeResponse.sharedKey);

  const activeUser = status.payload.filter((a) => a.active === true && a.status === "unlocked")[0];
  if (activeUser === undefined) {
    LogUtils.logError("No active or unlocked user");
  }
  LogUtils.logWarning("Active userId: " + activeUser.id);

  const response = await nativeMessageService.credentialUpdate(
    handshakeResponse.sharedKey,
    name,
    password,
    username,
    uri,
    activeUser.id,
    // Replace with credentialId you want to update
    "2a08b546-fa9d-48cc-ae8e-ae7601207da9"
  );

  if (response.payload.status === "failure") {
    LogUtils.logError("Failure response returned ");
  } else if (response.payload.status === "success") {
    LogUtils.logSuccess("Success response returned ");
  } else {
    LogUtils.logWarning("Other response: ", response);
  }

  nativeMessageService.disconnect();
})();
