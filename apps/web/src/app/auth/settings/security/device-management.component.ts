import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";

import { DeviceTrustServiceAbstraction } from "@bitwarden/common/auth/abstractions/device-trust.service.abstraction";
import { DevicesServiceAbstraction } from "@bitwarden/common/auth/abstractions/devices/devices.service.abstraction";
import { DeviceView } from "@bitwarden/common/auth/abstractions/devices/views/device.view";
import { DeviceType, DeviceTypeMetadata } from "@bitwarden/common/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { TableDataSource, TableModule } from "@bitwarden/components";

import { SharedModule } from "../../../shared";

interface DeviceTableData {
  id: string;
  type: DeviceType;
  displayName: string;
  loginStatus: string;
  firstLogin: Date;
  trusted: boolean;
}

@Component({
  selector: "app-device-management",
  templateUrl: "./device-management.component.html",
  standalone: true,
  imports: [CommonModule, SharedModule, TableModule],
})
export class DeviceManagementComponent implements OnInit {
  protected readonly tableId = "device-management-table";
  protected dataSource = new TableDataSource<DeviceTableData>();
  protected currentDevice: DeviceView | undefined;

  constructor(
    private i18nService: I18nService,
    private devicesService: DevicesServiceAbstraction,
    private deviceTrustService: DeviceTrustServiceAbstraction,
  ) {
    // Get current device
    this.deviceTrustService
      .getCurrentDevice$()
      .pipe(takeUntilDestroyed())
      .subscribe((device) => {
        this.currentDevice = new DeviceView(device);
      });

    // Get all devices and map them
    this.devicesService
      .getDevices$()
      .pipe(takeUntilDestroyed())
      .subscribe((devices) => {
        this.dataSource.data = devices.map((device) => {
          return {
            id: device.id,
            type: device.type,
            displayName: this.getHumanReadableDeviceType(device.type),
            loginStatus: this.getLoginStatus(device),
            firstLogin: new Date(device.creationDate),
            trusted: device.response.isTrusted,
          };
        });
      });
  }

  ngOnInit(): void {}

  protected readonly columnConfig = [
    {
      name: "deviceName",
      title: this.i18nService.t("device"),
      headerClass: "tw-w-1/3",
    },
    {
      name: "loginStatus",
      title: this.i18nService.t("loginStatus"),
      headerClass: "tw-w-1/3",
    },
    {
      name: "firstLogin",
      title: this.i18nService.t("firstLogin"),
      headerClass: "tw-w-1/4",
    },
  ];

  /**
   * Get the icon for a device type
   * @param type - The device type
   * @returns The icon for the device type
   */
  getDeviceIcon(type: DeviceType): string {
    const metadata = DeviceTypeMetadata[type];
    if (!metadata) {
      return "bwi bwi-device"; // fallback icon
    }
    // Map device categories to their corresponding icons
    const categoryIconMap: { [key: string]: string } = {
      webVault: "bwi bwi-browser",
      desktop: "bwi bwi-desktop",
      mobile: "bwi bwi-mobile",
      cli: "bwi bwi-cli",
      extension: "bwi bwi-puzzle",
      sdk: "bwi bwi-device",
    };

    return categoryIconMap[metadata.category] || "bwi bwi-device";
  }

  /**
   * Get the login status of a device
   * It will return the current session if the device is the current device
   * It will return the date of the pending auth request when available
   * @param device - The device
   * @returns The login status
   */
  private getLoginStatus(device: DeviceView): string {
    if (this.isCurrentDevice(device)) {
      return this.i18nService.t("currentSession");
    }

    if (device.response.devicePendingAuthRequest?.creationDate) {
      return new Date(device.response.devicePendingAuthRequest.creationDate).toLocaleDateString();
    }

    return "";
  }

  /**
   * Get a human readable device type from the DeviceType enum
   * @param type - The device type
   * @returns The human readable device type
   */
  private getHumanReadableDeviceType(type: DeviceType): string {
    const metadata = DeviceTypeMetadata[type];
    if (!metadata) {
      return this.i18nService.t("unknownDevice");
    }

    const category = this.i18nService.t(metadata.category);
    return metadata.platform ? `${category} - ${metadata.platform}` : category;
  }

  /**
   * Check if a device is the current device
   * @param device - The device or device table data
   * @returns True if the device is the current device, false otherwise
   */
  protected isCurrentDevice(device: DeviceView | DeviceTableData): boolean {
    return "response" in device
      ? device.id === this.currentDevice?.id
      : device.id === this.currentDevice?.id;
  }
}
