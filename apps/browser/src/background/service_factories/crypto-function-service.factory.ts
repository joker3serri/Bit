import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { WebCryptoFunctionService } from "@bitwarden/common/services/webCryptoFunction.service";

type CryptoFunctionServiceFactoryOptions = {
  win: Window | typeof global;
  cryptoFunctionService?: CryptoFunctionService;
};

export type CryptoFunctionServiceInitOptions = CryptoFunctionServiceFactoryOptions;

export function cryptoFunctionServiceFactory(
  opts: CryptoFunctionServiceFactoryOptions
): CryptoFunctionService {
  if (!opts.cryptoFunctionService) {
    opts.cryptoFunctionService = new WebCryptoFunctionService(opts.win);
  }
  return opts.cryptoFunctionService;
}
