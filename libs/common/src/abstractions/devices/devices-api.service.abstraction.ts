import { DeviceResponse } from "./responses/device.response";

export abstract class DevicesApiServiceAbstraction {
  getKnownDevice: (email: string, deviceIdentifier: string) => Promise<boolean>;

  /**
   * Get device by identifier (device identifier is client generated id - not device id in DB)
   */
  getDeviceByIdentifier: (deviceIdentifier: string) => Promise<DeviceResponse>;

  createTrustedDeviceKeys: (
    deviceId: string,
    devicePublicKeyEncryptedUserSymKey: string,
    userSymKeyEncryptedDevicePublicKey: string,
    deviceKeyEncryptedDevicePrivateKey: string
  ) => Promise<DeviceResponse>;

  updateTrustedDeviceKeys: (
    deviceId: string,
    devicePublicKeyEncryptedUserSymKey: string,
    userSymKeyEncryptedDevicePublicKey: string,
    deviceKeyEncryptedDevicePrivateKey: string
  ) => Promise<DeviceResponse>;
}
