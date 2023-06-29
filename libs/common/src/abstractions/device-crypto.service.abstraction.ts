import { DeviceKey, UserKey } from "../platform/models/domain/symmetric-crypto-key";

import { DeviceResponse } from "./devices/responses/device.response";

export abstract class DeviceCryptoServiceAbstraction {
  getUserTrustDeviceChoiceForDecryption: () => Promise<boolean>;
  setUserTrustDeviceChoiceForDecryption: (value: boolean) => Promise<void>;

  trustDevice: () => Promise<DeviceResponse>;
  getDeviceKey: () => Promise<DeviceKey>;
  // TODO: update param types when available
  decryptUserKey: (encryptedDevicePrivateKey: any, encryptedUserKey: any) => Promise<UserKey>;
}
