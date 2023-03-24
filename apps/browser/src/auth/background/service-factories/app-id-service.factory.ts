import { AppIdService as AppIdServiceAbstraction } from "@bitwarden/common/abstractions/appId.service";
import { AppIdService } from "@bitwarden/common/services/appId.service";

import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../background/service_factories/factory-options";

import { storageServiceFactory, StorageServiceInitOptions } from "./storage-service.factory";

type AppIdServiceFactoryOptions = FactoryOptions;

export type AppIdServiceInitOptions = AppIdServiceFactoryOptions & StorageServiceInitOptions;

export function appIdServiceFactory(
  cache: { appIdService?: AppIdServiceAbstraction } & CachedServices,
  opts: AppIdServiceInitOptions
): Promise<AppIdServiceAbstraction> {
  return factory(
    cache,
    "appIdService",
    opts,
    async () => new AppIdService(await storageServiceFactory(cache, opts))
  );
}
