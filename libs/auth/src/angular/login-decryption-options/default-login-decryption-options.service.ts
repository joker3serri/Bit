import { LoginDecryptionOptionsService } from "./login-decryption-options.service";

export class DefaultLoginDecryptionOptionsService implements LoginDecryptionOptionsService {
  constructor() {}

  handleCreateUserSuccess(): Promise<void | null> {
    return null;
  }
}
