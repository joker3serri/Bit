import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { WebCryptoFunctionService } from "@bitwarden/common/services/webCryptoFunction.service";

import { factory, FactoryOptions } from "./factory-options";

type CryptoFunctionServiceFactoryOptions = FactoryOptions & {
  win: Window | typeof global;
  instances: {
    cryptoFunctionService?: CryptoFunctionService;
  };
};

export type CryptoFunctionServiceInitOptions = CryptoFunctionServiceFactoryOptions;

export function cryptoFunctionServiceFactory(
  opts: CryptoFunctionServiceFactoryOptions
): CryptoFunctionService {
  return factory(opts, "cryptoFunctionService", () => new WebCryptoFunctionService(opts.win));
}
