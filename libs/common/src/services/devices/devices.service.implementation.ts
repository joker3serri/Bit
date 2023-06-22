import { BehaviorSubject, Observable, defer, map, tap } from "rxjs";

import { DevicesApiServiceAbstraction } from "../../abstractions/devices/devices-api.service.abstraction";
import { DevicesServiceAbstraction } from "../../abstractions/devices/devices.service.abstraction";
import { DeviceResponse } from "../../abstractions/devices/responses/device.response";
import { DeviceView } from "../../abstractions/devices/views/device.view";
import { DeviceType } from "../../enums";
import { ListResponse } from "../../models/response/list.response";

/**
 * @class DevicesServiceImplementation
 * @implements {DevicesServiceAbstraction}
 * @description Observable based data store service for Devices.
 * note: defer is used to convert the promises to observables and to ensure
 * that observables are created for each subscription
 * (i.e., promsise --> observables are cold until subscribed to)
 */
export class DevicesServiceImplementation implements DevicesServiceAbstraction {
  private devicesBSubject: BehaviorSubject<Array<DeviceView>> = new BehaviorSubject<
    Array<DeviceView>
  >([]);

  /**
   * @description Observable for devices in data store
   */
  devices$: Observable<Array<DeviceView>> = this.devicesBSubject.asObservable();

  /**
   * @description Synchronous getter for current value of devices in data store
   */
  get devices(): Array<DeviceView> {
    return this.devicesBSubject.value;
  }

  constructor(private devicesApiService: DevicesApiServiceAbstraction) {}

  /**
   * @description Gets the list of all devices.
   */
  getDevices(): Observable<Array<DeviceView>> {
    return defer(() => this.devicesApiService.getDevices()).pipe(
      map((deviceResponses: ListResponse<DeviceResponse>) => {
        return deviceResponses.data.map((deviceResponse: DeviceResponse) => {
          return new DeviceView(deviceResponse);
        });
      }),
      tap((deviceViews: Array<DeviceView>) => {
        this.devicesBSubject.next(deviceViews);
      })
    );
  }

  /**
   * @description Returns whether the user has any devices of the specified types.
   */
  getDevicesExistenseByTypes(deviceTypes: DeviceType[]): Observable<boolean> {
    return defer(() => this.devicesApiService.getDevicesExistenseByTypes(deviceTypes));
  }

  /**
   * @description Gets the device with the specified identifier.
   */
  getDeviceByIdentifier(deviceIdentifier: string): Observable<DeviceView> {
    return defer(() => this.devicesApiService.getDeviceByIdentifier(deviceIdentifier)).pipe(
      map((deviceResponse: DeviceResponse) => new DeviceView(deviceResponse)),
      tap((deviceView: DeviceView) => {
        this.upsertDevice(deviceView);
      })
    );
  }

  /**
   * @description Checks if a device is known for a user by user's email and device's identifier.
   */
  isDeviceKnownForUser(email: string, deviceIdentifier: string): Observable<boolean> {
    return defer(() => this.devicesApiService.getKnownDevice(email, deviceIdentifier));
  }

  /**
   * @description Updates the keys for the specified device.
   */

  updateTrustedDeviceKeys(
    deviceIdentifier: string,
    devicePublicKeyEncryptedUserSymKey: string,
    userSymKeyEncryptedDevicePublicKey: string,
    deviceKeyEncryptedDevicePrivateKey: string
  ): Observable<DeviceView> {
    return defer(() =>
      this.devicesApiService.updateTrustedDeviceKeys(
        deviceIdentifier,
        devicePublicKeyEncryptedUserSymKey,
        userSymKeyEncryptedDevicePublicKey,
        deviceKeyEncryptedDevicePrivateKey
      )
    ).pipe(
      map((deviceResponse: DeviceResponse) => new DeviceView(deviceResponse)),
      tap((deviceView: DeviceView) => {
        this.upsertDevice(deviceView);
      })
    );
  }

  /**
   * @description Updates a device in the current device store, or adds it if it doesn't exist.
   */
  private upsertDevice(updatedDevice: DeviceView): void {
    const currentDevices = this.devicesBSubject.value;

    const deviceIndex = currentDevices.findIndex(
      (device) => device.identifier === updatedDevice.identifier
    );

    if (deviceIndex >= 0) {
      // If the device exists, update it
      currentDevices[deviceIndex] = updatedDevice;
    } else {
      // Otherwise, add the new device to the store
      currentDevices.push(updatedDevice);
    }

    this.devicesBSubject.next(currentDevices);
  }
}
