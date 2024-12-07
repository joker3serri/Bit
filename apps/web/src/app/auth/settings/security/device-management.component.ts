import { Component, OnInit } from "@angular/core";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { AccountService } from "@bitwarden/common/auth/abstractions/account.service";
import { DialogService } from "@bitwarden/components";

@Component({
  selector: "app-device-management",
  templateUrl: "./device-management.component.html",
})
export class DeviceManagementComponent implements OnInit {
  constructor(
    private accountService: AccountService,
    private apiService: ApiService,
    private dialogService: DialogService,
  ) {}

  async ngOnInit() {
    // TODO: Load devices
  }

  async revokeDevice() {
    // TODO: Implement device revocation using dialogService for confirmation
  }
}
