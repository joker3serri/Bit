import { DevicesApiServiceAbstraction } from "../../abstractions/devices/devices-api.service.abstraction";
import { DeviceResponse } from "../../abstractions/devices/responses/device.response";
import { Utils } from "../../misc/utils";
import { ApiService } from "../api.service";

import { TrustedDeviceKeysRequest } from "./requests/trusted-device-keys.request";

export class DevicesApiServiceImplementation implements DevicesApiServiceAbstraction {
  constructor(private apiService: ApiService) {}

  async getKnownDevice(email: string, deviceIdentifier: string): Promise<boolean> {
    const r = await this.apiService.send(
      "GET",
      "/devices/knowndevice",
      null,
      false,
      true,
      null,
      (headers) => {
        headers.set("X-Device-Identifier", deviceIdentifier);
        headers.set("X-Request-Email", Utils.fromUtf8ToUrlB64(email));
      }
    );
    return r as boolean;
  }

  async getDeviceByIdentifier(deviceIdentifier: string): Promise<DeviceResponse> {
    const r = await this.apiService.send(
      "GET",
      `/devices/identifier/${deviceIdentifier}`,
      null,
      true,
      true
    );
    return new DeviceResponse(r);
  }

  async createTrustedDeviceKeys(
    deviceId: string,
    devicePublicKeyEncryptedUserSymKey: string,
    userSymKeyEncryptedDevicePublicKey: string,
    deviceKeyEncryptedDevicePrivateKey: string
  ): Promise<DeviceResponse> {
    const request = new TrustedDeviceKeysRequest(
      devicePublicKeyEncryptedUserSymKey,
      userSymKeyEncryptedDevicePublicKey,
      deviceKeyEncryptedDevicePrivateKey
    );

    const result = await this.apiService.send(
      "POST",
      `/devices/${deviceId}/keys`,
      request,
      true,
      true
    );

    return new DeviceResponse(result);
  }

  async updateTrustedDeviceKeys(
    deviceId: string,
    devicePublicKeyEncryptedUserSymKey: string,
    userSymKeyEncryptedDevicePublicKey: string,
    deviceKeyEncryptedDevicePrivateKey: string
  ): Promise<DeviceResponse> {
    const request = new TrustedDeviceKeysRequest(
      devicePublicKeyEncryptedUserSymKey,
      userSymKeyEncryptedDevicePublicKey,
      deviceKeyEncryptedDevicePrivateKey
    );

    const result = await this.apiService.send(
      "PUT",
      `/devices/${deviceId}/keys`,
      request,
      true,
      true
    );

    return new DeviceResponse(result);
  }
}
