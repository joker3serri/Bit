import { StateService } from "src/services/abstractions/state.service";

export class UpdateLastUsedCipherDateCommand {
  constructor(private stateService: StateService) {}

  async updateLastUsedDate(id: string): Promise<void> {
    let ciphersLocalData = await this.stateService.getLocalData();
    if (!ciphersLocalData) {
      ciphersLocalData = {};
    }

    if (ciphersLocalData[id]) {
      ciphersLocalData[id].lastUsedDate = new Date().getTime();
    } else {
      ciphersLocalData[id] = {
        lastUsedDate: new Date().getTime(),
      };
    }

    await this.stateService.setLocalData(ciphersLocalData);

    const decryptedCipherCache = await this.stateService.getDecryptedCiphers();
    if (!decryptedCipherCache) {
      return;
    }

    for (let i = 0; i < decryptedCipherCache.length; i++) {
      const cached = decryptedCipherCache[i];
      if (cached.id === id) {
        cached.localData = ciphersLocalData[id];
        break;
      }
    }
    await this.stateService.setDecryptedCiphers(decryptedCipherCache);
  }
}
