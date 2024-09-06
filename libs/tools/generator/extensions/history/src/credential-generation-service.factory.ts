import { CryptoService } from "@bitwarden/common/platform/abstractions/crypto.service";
import { EncryptService } from "@bitwarden/common/platform/abstractions/encrypt.service";
import { StateProvider } from "@bitwarden/common/platform/state";
import {
  GeneratorHistoryService,
  LocalGeneratorHistoryService,
} from "@bitwarden/generator-history";

export function credentialGenerationServiceFactory(
  encryptService: EncryptService,
  cryptoService: CryptoService,
  stateProvider: StateProvider,
): GeneratorHistoryService {
  return new LocalGeneratorHistoryService(encryptService, cryptoService, stateProvider);
}
