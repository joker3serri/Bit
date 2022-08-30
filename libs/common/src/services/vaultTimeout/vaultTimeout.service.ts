import { AuthService } from "../../abstractions/auth.service";
import { PlatformUtilsService } from "../../abstractions/platformUtils.service";
import { StateService } from "../../abstractions/state.service";
import { VaultTimeoutService as VaultTimeoutServiceAbstraction } from "../../abstractions/vaultTimeout/vaultTimeout.service";
import { VaultTimeoutActionService as VaultTimeoutActionServiceAbstraction } from "../../abstractions/vaultTimeout/vaultTimeoutAction.service";
import { VaultTimeoutSettingsService } from "../../abstractions/vaultTimeout/vaultTimeoutSettings.service";
import { AuthenticationStatus } from "../../enums/authenticationStatus";

export class VaultTimeoutService implements VaultTimeoutServiceAbstraction {
  private inited = false;

  constructor(
    protected platformUtilsService: PlatformUtilsService,
    private stateService: StateService,
    private authService: AuthService,
    private vaultTimeoutSettingsService: VaultTimeoutSettingsService,
    private vaultTimeoutActionService: VaultTimeoutActionServiceAbstraction
  ) {}

  init(checkOnInterval: boolean) {
    if (this.inited) {
      return;
    }

    this.inited = true;
    if (checkOnInterval) {
      this.startCheck();
    }
  }

  startCheck() {
    this.checkVaultTimeout();
    setInterval(() => this.checkVaultTimeout(), 10 * 1000); // check every 10 seconds
  }

  async checkVaultTimeout(): Promise<void> {
    if (await this.platformUtilsService.isViewOpen()) {
      return;
    }

    for (const userId in this.stateService.accounts.getValue()) {
      if (userId != null && (await this.shouldLock(userId))) {
        await this.executeTimeoutAction(userId);
      }
    }
  }

  private async shouldLock(userId: string): Promise<boolean> {
    const authStatus = await this.authService.getAuthStatus(userId);
    if (
      authStatus === AuthenticationStatus.Locked ||
      authStatus === AuthenticationStatus.LoggedOut
    ) {
      return false;
    }

    const vaultTimeout = await this.vaultTimeoutSettingsService.getVaultTimeout(userId);
    if (vaultTimeout == null || vaultTimeout < 0) {
      return false;
    }

    const lastActive = await this.stateService.getLastActive({ userId: userId });
    if (lastActive == null) {
      return false;
    }

    const vaultTimeoutSeconds = vaultTimeout * 60;
    const diffSeconds = (new Date().getTime() - lastActive) / 1000;
    return diffSeconds >= vaultTimeoutSeconds;
  }

  private async executeTimeoutAction(userId: string): Promise<void> {
    const timeoutAction = await this.stateService.getVaultTimeoutAction({ userId: userId });
    timeoutAction === "logOut"
      ? await this.vaultTimeoutActionService.logOut(userId)
      : await this.vaultTimeoutActionService.lock(userId);
  }
}
