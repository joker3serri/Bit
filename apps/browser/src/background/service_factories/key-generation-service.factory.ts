import { KeyGenerationService } from "../../services/keyGeneration.service";

import {
  cryptoFunctionServiceFactory,
  CryptoFunctionServiceInitOptions,
} from "./crypto-function-service.factory";
import { factory, FactoryOptions } from "./factory-options";

type KeyGenerationServiceFactoryOptions = FactoryOptions & {
  instances: {
    keyGenerationService?: KeyGenerationService;
  };
};

export type KeyGenerationServiceInitOptions = KeyGenerationServiceFactoryOptions &
  CryptoFunctionServiceInitOptions;

export function keyGenerationServiceFactory(
  opts: KeyGenerationServiceInitOptions
): KeyGenerationService {
  return factory(
    opts,
    "keyGenerationService",
    () => new KeyGenerationService(cryptoFunctionServiceFactory(opts))
  );
}
