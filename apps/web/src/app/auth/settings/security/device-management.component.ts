import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { TableDataSource, TableModule } from "@bitwarden/components";

import { SharedModule } from "../../../shared";
import { TableScrollComponent } from "@bitwarden/components/src/table/table-scroll.component";

interface Device {
  type: string;
  deviceName: string;
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
  protected dataSource = new TableDataSource<Device>();

  constructor(private i18nService: I18nService) {}

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

  currentDeviceId = "device-1";

  devices: Device[] = [
    {
      type: "browser",
      deviceName: "Web app - Chrome",
      loginStatus: "Current session",
      firstLogin: new Date("2026-09-20T09:25:54"),
      trusted: true,
    },
    {
      type: "extension",
      deviceName: "Extension - Chrome",
      loginStatus: "This week",
      firstLogin: new Date("2026-09-20T09:25:54"),
      trusted: true,
    },
    {
      type: "cli",
      deviceName: "CLI - macOS",
      loginStatus: "This month",
      firstLogin: new Date("2026-09-20T09:25:54"),
      trusted: true,
    },
    {
      type: "mobile",
      deviceName: "Mobile - iOS",
      loginStatus: "",
      firstLogin: new Date("2026-09-20T09:25:54"),
      trusted: true,
    },
  ];

  ngOnInit() {
    this.dataSource.data = this.devices;
  }

  getDeviceIcon(type: string): string {
    const iconMap: { [key: string]: string } = {
      browser: "bwi bwi-browser",
      extension: "bwi bwi-puzzle",
      cli: "bwi bwi-cli",
      mobile: "bwi bwi-mobile",
    };
    return iconMap[type] || "bwi bwi-device";
  }
}
