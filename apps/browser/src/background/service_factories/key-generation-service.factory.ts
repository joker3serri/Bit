import { KeyGenerationService } from "../../services/keyGeneration.service";

import {
  cryptoFunctionServiceFactory,
  CryptoFunctionServiceInitOptions,
} from "./crypto-function-service.factory";

type KeyGenerationServiceFactoryOptions = {
  keyGenerationService?: KeyGenerationService;
};

export type KeyGenerationServiceInitOptions = KeyGenerationServiceFactoryOptions &
  CryptoFunctionServiceInitOptions;

export function keyGenerationServiceFactory(
  opts: KeyGenerationServiceInitOptions
): KeyGenerationService {
  if (!opts.keyGenerationService) {
    opts.keyGenerationService = new KeyGenerationService(cryptoFunctionServiceFactory(opts));
  }
  return opts.keyGenerationService;
}
