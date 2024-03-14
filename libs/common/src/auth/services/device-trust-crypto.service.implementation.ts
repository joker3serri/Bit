import { firstValueFrom } from "rxjs";

import { AppIdService } from "../../platform/abstractions/app-id.service";
import { CryptoFunctionService } from "../../platform/abstractions/crypto-function.service";
import { CryptoService } from "../../platform/abstractions/crypto.service";
import { EncryptService } from "../../platform/abstractions/encrypt.service";
import { I18nService } from "../../platform/abstractions/i18n.service";
import { KeyGenerationService } from "../../platform/abstractions/key-generation.service";
import { PlatformUtilsService } from "../../platform/abstractions/platform-utils.service";
import { StateService } from "../../platform/abstractions/state.service";
import { AbstractStorageService } from "../../platform/abstractions/storage.service";
import { StorageLocation } from "../../platform/enums";
import { EncString } from "../../platform/models/domain/enc-string";
import { StorageOptions } from "../../platform/models/domain/storage-options";
import { SymmetricCryptoKey } from "../../platform/models/domain/symmetric-crypto-key";
import {
  ActiveUserState,
  DEVICE_TRUST_DISK,
  KeyDefinition,
  StateProvider,
} from "../../platform/state";
import { UserId } from "../../types/guid";
import { UserKey, DeviceKey } from "../../types/key";
import { DeviceTrustCryptoServiceAbstraction } from "../abstractions/device-trust-crypto.service.abstraction";
import { DeviceResponse } from "../abstractions/devices/responses/device.response";
import { DevicesApiServiceAbstraction } from "../abstractions/devices-api.service.abstraction";
import { SecretVerificationRequest } from "../models/request/secret-verification.request";
import {
  DeviceKeysUpdateRequest,
  UpdateDevicesTrustRequest,
} from "../models/request/update-devices-trust.request";

/**
 * Uses disk storage so that the device key can persist after log out and tab removal.
 */
export const DEVICE_KEY = new KeyDefinition<DeviceKey>(DEVICE_TRUST_DISK, "deviceKey", {
  deserializer: (deviceKey) => SymmetricCryptoKey.fromJSON(deviceKey) as DeviceKey,
});

/**
 * Uses disk storage so that the shouldTrustDevice bool can persist across login.
 */
export const SHOULD_TRUST_DEVICE = new KeyDefinition<boolean>(
  DEVICE_TRUST_DISK,
  "shouldTrustDevice",
  {
    deserializer: (shouldTrustDevice) => shouldTrustDevice,
  },
);

export class DeviceTrustCryptoService implements DeviceTrustCryptoServiceAbstraction {
  private deviceKeyState: ActiveUserState<DeviceKey>;

  private readonly platformSupportsSecureStorage =
    this.platformUtilsService.supportsSecureStorage();
  private readonly deviceKeySecureStorageKey: string = "_deviceKey";
  private shouldTrustDeviceState: ActiveUserState<boolean>;

  constructor(
    private keyGenerationService: KeyGenerationService,
    private cryptoFunctionService: CryptoFunctionService,
    private cryptoService: CryptoService,
    private encryptService: EncryptService,
    private stateService: StateService,
    private appIdService: AppIdService,
    private devicesApiService: DevicesApiServiceAbstraction,
    private i18nService: I18nService,
    private platformUtilsService: PlatformUtilsService,
    private stateProvider: StateProvider,
    private secureStorageService: AbstractStorageService,
  ) {
    this.deviceKeyState = this.stateProvider.getActive(DEVICE_KEY);
    this.shouldTrustDeviceState = this.stateProvider.getActive(SHOULD_TRUST_DEVICE);
  }

  /**
   * @description Retrieves the users choice to trust the device which can only happen after decryption
   * Note: this value should only be used once and then reset
   */
  async getShouldTrustDevice(): Promise<boolean> {
    return firstValueFrom(this.shouldTrustDeviceState.state$);
  }

  async setShouldTrustDevice(value: boolean): Promise<void> {
    await this.shouldTrustDeviceState.update((_) => value);
  }

  async trustDeviceIfRequired(): Promise<void> {
    const shouldTrustDevice = await this.getShouldTrustDevice();
    if (shouldTrustDevice) {
      await this.trustDevice();
      // reset the trust choice
      await this.setShouldTrustDevice(false);
    }
  }

  async trustDevice(): Promise<DeviceResponse> {
    // Attempt to get user key
    const userKey: UserKey = await this.cryptoService.getUserKey();

    // If user key is not found, throw error
    if (!userKey) {
      throw new Error("User symmetric key not found");
    }

    // Generate deviceKey
    const deviceKey = await this.makeDeviceKey();

    // Generate asymmetric RSA key pair: devicePrivateKey, devicePublicKey
    const [devicePublicKey, devicePrivateKey] =
      await this.cryptoFunctionService.rsaGenerateKeyPair(2048);

    const [
      devicePublicKeyEncryptedUserKey,
      userKeyEncryptedDevicePublicKey,
      deviceKeyEncryptedDevicePrivateKey,
    ] = await Promise.all([
      // Encrypt user key with the DevicePublicKey
      this.cryptoService.rsaEncrypt(userKey.key, devicePublicKey),

      // Encrypt devicePublicKey with user key
      this.encryptService.encrypt(devicePublicKey, userKey),

      // Encrypt devicePrivateKey with deviceKey
      this.encryptService.encrypt(devicePrivateKey, deviceKey),
    ]);

    // Send encrypted keys to server
    const deviceIdentifier = await this.appIdService.getAppId();
    const deviceResponse = await this.devicesApiService.updateTrustedDeviceKeys(
      deviceIdentifier,
      devicePublicKeyEncryptedUserKey.encryptedString,
      userKeyEncryptedDevicePublicKey.encryptedString,
      deviceKeyEncryptedDevicePrivateKey.encryptedString,
    );

    // store device key in local/secure storage if enc keys posted to server successfully
    await this.setDeviceKey(deviceKey);

    this.platformUtilsService.showToast("success", null, this.i18nService.t("deviceTrusted"));

    return deviceResponse;
  }

  async rotateDevicesTrust(newUserKey: UserKey, masterPasswordHash: string): Promise<void> {
    const currentDeviceKey = await this.getDeviceKey();
    if (currentDeviceKey == null) {
      // If the current device doesn't have a device key available to it, then we can't
      // rotate any trust at all, so early return.
      return;
    }

    // At this point of rotating their keys, they should still have their old user key in state
    const oldUserKey = await firstValueFrom(this.cryptoService.activeUserKey$);

    const deviceIdentifier = await this.appIdService.getAppId();
    const secretVerificationRequest = new SecretVerificationRequest();
    secretVerificationRequest.masterPasswordHash = masterPasswordHash;

    // Get the keys that are used in rotating a devices keys from the server
    const currentDeviceKeys = await this.devicesApiService.getDeviceKeys(
      deviceIdentifier,
      secretVerificationRequest,
    );

    // Decrypt the existing device public key with the old user key
    const decryptedDevicePublicKey = await this.encryptService.decryptToBytes(
      currentDeviceKeys.encryptedPublicKey,
      oldUserKey,
    );

    // Encrypt the brand new user key with the now-decrypted public key for the device
    const encryptedNewUserKey = await this.cryptoService.rsaEncrypt(
      newUserKey.key,
      decryptedDevicePublicKey,
    );

    // Re-encrypt the device public key with the new user key
    const encryptedDevicePublicKey = await this.encryptService.encrypt(
      decryptedDevicePublicKey,
      newUserKey,
    );

    const currentDeviceUpdateRequest = new DeviceKeysUpdateRequest();
    currentDeviceUpdateRequest.encryptedUserKey = encryptedNewUserKey.encryptedString;
    currentDeviceUpdateRequest.encryptedPublicKey = encryptedDevicePublicKey.encryptedString;

    // TODO: For device management, allow this method to take an array of device ids that can be looped over and individually rotated
    // then it can be added to trustRequest.otherDevices.

    const trustRequest = new UpdateDevicesTrustRequest();
    trustRequest.masterPasswordHash = masterPasswordHash;
    trustRequest.currentDevice = currentDeviceUpdateRequest;
    trustRequest.otherDevices = [];

    await this.devicesApiService.updateTrust(trustRequest, deviceIdentifier);
  }

  async getDeviceKey(): Promise<DeviceKey | null> {
    if (this.platformSupportsSecureStorage) {
      // get active user id
      const userId = await firstValueFrom(this.stateProvider.activeUserId$);

      if (!userId) {
        throw new Error("No active user id found. Cannot get device key from secure storage.");
      }

      return await this.secureStorageService.get<DeviceKey>(
        `${userId}${this.deviceKeySecureStorageKey}`,
        this.getSecureStorageOptions(userId),
      );
    }

    return firstValueFrom(this.deviceKeyState.state$);
  }

  private async setDeviceKey(deviceKey: DeviceKey | null): Promise<void> {
    if (this.platformSupportsSecureStorage) {
      const userId = await firstValueFrom(this.stateProvider.activeUserId$);

      if (!userId) {
        throw new Error("No active user id found. Cannot set device key in secure storage.");
      }

      await this.secureStorageService.save<DeviceKey>(
        `${userId}${this.deviceKeySecureStorageKey}`,
        deviceKey,
        this.getSecureStorageOptions(userId),
      );
      return;
    }

    await this.deviceKeyState.update((_) => deviceKey);
  }

  private async makeDeviceKey(): Promise<DeviceKey> {
    // Create 512-bit device key
    return (await this.keyGenerationService.createKey(512)) as DeviceKey;
  }

  async decryptUserKeyWithDeviceKey(
    encryptedDevicePrivateKey: EncString,
    encryptedUserKey: EncString,
    deviceKey?: DeviceKey,
  ): Promise<UserKey | null> {
    // If device key provided use it, otherwise try to retrieve from storage
    deviceKey ||= await this.getDeviceKey();

    if (!deviceKey) {
      // User doesn't have a device key anymore so device is untrusted
      return null;
    }

    try {
      // attempt to decrypt encryptedDevicePrivateKey with device key
      const devicePrivateKey = await this.encryptService.decryptToBytes(
        encryptedDevicePrivateKey,
        deviceKey,
      );

      // Attempt to decrypt encryptedUserDataKey with devicePrivateKey
      const userKey = await this.cryptoService.rsaDecrypt(
        encryptedUserKey.encryptedString,
        devicePrivateKey,
      );

      return new SymmetricCryptoKey(userKey) as UserKey;
    } catch (e) {
      // If either decryption effort fails, we want to remove the device key
      await this.setDeviceKey(null);

      return null;
    }
  }

  async supportsDeviceTrust(): Promise<boolean> {
    const decryptionOptions = await this.stateService.getAccountDecryptionOptions();
    return decryptionOptions?.trustedDeviceOption != null;
  }

  private getSecureStorageOptions(userId: UserId): StorageOptions {
    return {
      storageLocation: StorageLocation.Disk,
      useSecureStorage: true,
      userId: userId,
    };
  }
}
