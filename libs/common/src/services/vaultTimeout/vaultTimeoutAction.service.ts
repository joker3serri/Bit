import { CipherService } from "../../abstractions/cipher.service";
import { CollectionService } from "../../abstractions/collection.service";
import { CryptoService } from "../../abstractions/crypto.service";
import { FolderService } from "../../abstractions/folder/folder.service.abstraction";
import { KeyConnectorService } from "../../abstractions/keyConnector.service";
import { MessagingService } from "../../abstractions/messaging.service";
import { SearchService } from "../../abstractions/search.service";
import { StateService } from "../../abstractions/state.service";
import { VaultTimeoutActionService as VaultTimeoutActionServiceAbstraction } from "../../abstractions/vaultTimeout/vaultTimeoutAction.service";
import { VaultTimeoutSettingsService } from "../../abstractions/vaultTimeout/vaultTimeoutSettings.service";

export class VaultTimeoutActionService implements VaultTimeoutActionServiceAbstraction {
  constructor(
    private cipherService: CipherService,
    private folderService: FolderService,
    private collectionService: CollectionService,
    private cryptoService: CryptoService,
    private messagingService: MessagingService,
    private searchService: SearchService,
    private keyConnectorService: KeyConnectorService,
    private stateService: StateService,
    private vaultTimeoutSettingsService: VaultTimeoutSettingsService,
    private lockedCallback: (userId?: string) => Promise<void> = null,
    private loggedOutCallback: (expired: boolean, userId?: string) => Promise<void> = null
  ) {}

  async lock(userId?: string): Promise<void> {
    const authed = await this.stateService.getIsAuthenticated({ userId: userId });
    if (!authed) {
      return;
    }

    if (await this.keyConnectorService.getUsesKeyConnector()) {
      const pinSet = await this.vaultTimeoutSettingsService.isPinLockSet();
      const pinLock =
        (pinSet[0] && (await this.stateService.getDecryptedPinProtected()) != null) || pinSet[1];

      if (!pinLock && !(await this.vaultTimeoutSettingsService.isBiometricLockSet())) {
        await this.logOut(userId);
      }
    }

    if (userId == null || userId === (await this.stateService.getUserId())) {
      this.searchService.clearIndex();
      await this.folderService.clearCache();
    }

    await this.stateService.setEverBeenUnlocked(true, { userId: userId });
    await this.stateService.setCryptoMasterKeyAuto(null, { userId: userId });

    await this.cryptoService.clearKey(false, userId);
    await this.cryptoService.clearOrgKeys(true, userId);
    await this.cryptoService.clearKeyPair(true, userId);
    await this.cryptoService.clearEncKey(true, userId);

    await this.cipherService.clearCache(userId);
    await this.collectionService.clearCache(userId);

    this.messagingService.send("locked", { userId: userId });

    if (this.lockedCallback != null) {
      await this.lockedCallback(userId);
    }
  }

  async logOut(userId?: string): Promise<void> {
    if (this.loggedOutCallback != null) {
      await this.loggedOutCallback(false, userId);
    }
  }
}
