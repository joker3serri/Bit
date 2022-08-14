/* eslint-disable no-console */
import NativeMessageService from "./nativeMessageService";
import * as config from "./variables";

(async () => {
  const nativeMessageService = new NativeMessageService(1.0);

  const response = await nativeMessageService.sendHandshake(config.testRsaPublicKey);

  if (response.status === "success") {
    console.log(`Handshake success. Received shared key: ${response.sharedKey}`);
  } else {
    console.log(`Handshake was cancelled`);
  }
})();
