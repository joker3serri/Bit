/* eslint-disable*/
import "module-alias/register";
import NativeMessageService from "./nativeMessageService";
import * as config from "./variables";

(async () => {
  const nativeMessageService = new NativeMessageService(1.0);

  const handshakeResponse = await nativeMessageService.sendHandshake(config.testRsaPublicKey);

  if (handshakeResponse.status !== "success") {
    console.log(`Handshake failed. Status was: ${handshakeResponse.status}`);
    return;
  }

  const status = await nativeMessageService.checkStatus(handshakeResponse.sharedKey);

  console.log(`Status output is: `, status);

  nativeMessageService.disconnect();
})();
