import { LoginDecryptionOptionsService } from "./login-decryption-options.service";

export class DefaultLoginDecryptionOptionsService implements LoginDecryptionOptionsService {
  handleCreateUserSuccess(): Promise<void> {
    return null;
  }
}
