import { AuthRequestCryptoServiceAbstraction } from "@bitwarden/common/auth/abstractions/auth-request-crypto.service.abstraction";
import { AuthRequestCryptoServiceImplementation } from "@bitwarden/common/auth/services/auth-request-crypto.service.implementation";

import {
  CryptoServiceInitOptions,
  cryptoServiceFactory,
} from "../../../platform/background/service-factories/crypto-service.factory";
import {
  CachedServices,
  FactoryOptions,
  factory,
} from "../../../platform/background/service-factories/factory-options";

import { accountServiceFactory, AccountServiceInitOptions } from "./account-service.factory";
import {
  internalMasterPasswordServiceFactory,
  MasterPasswordServiceInitOptions,
} from "./master-password-service.factory";

type AuthRequestCryptoServiceFactoryOptions = FactoryOptions;

export type AuthRequestCryptoServiceInitOptions = AuthRequestCryptoServiceFactoryOptions &
  AccountServiceInitOptions &
  MasterPasswordServiceInitOptions &
  CryptoServiceInitOptions;

export function authRequestCryptoServiceFactory(
  cache: { authRequestCryptoService?: AuthRequestCryptoServiceAbstraction } & CachedServices,
  opts: AuthRequestCryptoServiceInitOptions,
): Promise<AuthRequestCryptoServiceAbstraction> {
  return factory(
    cache,
    "authRequestCryptoService",
    opts,
    async () =>
      new AuthRequestCryptoServiceImplementation(
        await accountServiceFactory(cache, opts),
        await internalMasterPasswordServiceFactory(cache, opts),
        await cryptoServiceFactory(cache, opts),
      ),
  );
}
