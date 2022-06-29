import { Cipher } from "@bitwarden/common/models/domain/cipher";

import { StateService } from "src/services/abstractions/state.service";

export class GetCipherCommand {
  constructor(protected stateService: StateService) {}

  async get(id: string): Promise<Cipher> {
    const ciphers = await this.stateService.getEncryptedCiphers();
    // eslint-disable-next-line
    if (ciphers == null || !ciphers.hasOwnProperty(id)) {
      return null;
    }

    const localData = await this.stateService.getLocalData();
    return new Cipher(ciphers[id], localData ? localData[id] : null);
  }

  async getAll(): Promise<Cipher[]> {
    const localData = await this.stateService.getLocalData();
    const ciphers = await this.stateService.getEncryptedCiphers();
    const response: Cipher[] = [];
    for (const id in ciphers) {
      // eslint-disable-next-line
      if (ciphers.hasOwnProperty(id)) {
        response.push(new Cipher(ciphers[id], localData ? localData[id] : null));
      }
    }
    return response;
  }
}
