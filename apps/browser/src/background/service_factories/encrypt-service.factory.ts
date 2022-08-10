import { EncryptService } from "@bitwarden/common/services/encrypt.service";

import {
  cryptoFunctionServiceFactory,
  CryptoFunctionServiceInitOptions,
} from "./crypto-function-service.factory";
import { LogServiceInitOptions, logServiceFactory } from "./log-service.factory";

type EncryptServiceFactoryOptions = {
  logMacFailures: boolean;
  encryptService?: EncryptService;
};

export type EncryptServiceInitOptions = EncryptServiceFactoryOptions &
  CryptoFunctionServiceInitOptions &
  LogServiceInitOptions;

export function encryptServiceFactory(opts: EncryptServiceInitOptions): EncryptService {
  if (!opts.encryptService) {
    opts.encryptService = new EncryptService(
      cryptoFunctionServiceFactory(opts),
      logServiceFactory(opts),
      opts.logMacFailures
    );
  }
  return opts.encryptService;
}
