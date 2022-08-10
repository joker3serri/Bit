import { EncryptService } from "@bitwarden/common/services/encrypt.service";

import {
  cryptoFunctionServiceFactory,
  CryptoFunctionServiceInitOptions,
} from "./crypto-function-service.factory";
import { factory, FactoryOptions } from "./factory-options";
import { LogServiceInitOptions, logServiceFactory } from "./log-service.factory";

type EncryptServiceFactoryOptions = FactoryOptions & {
  logMacFailures: boolean;
  instances: {
    encryptService?: EncryptService;
  };
};

export type EncryptServiceInitOptions = EncryptServiceFactoryOptions &
  CryptoFunctionServiceInitOptions &
  LogServiceInitOptions;

export function encryptServiceFactory(opts: EncryptServiceInitOptions): EncryptService {
  return factory(
    opts,
    "encryptService",
    () =>
      new EncryptService(
        cryptoFunctionServiceFactory(opts),
        logServiceFactory(opts),
        opts.logMacFailures
      )
  );
}
