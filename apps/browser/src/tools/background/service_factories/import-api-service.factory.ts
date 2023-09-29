import { ImportApiService, ImportApiServiceAbstraction } from "@bitwarden/importer";

import {
  ApiServiceInitOptions,
  apiServiceFactory,
} from "../../../platform/background/service-factories/api-service.factory";
import {
  FactoryOptions,
  CachedServices,
  factory,
} from "../../../platform/background/service-factories/factory-options";

export type ImportApiServiceInitOptions = FactoryOptions & ApiServiceInitOptions;

export function importApiServiceFactory(
  cache: { importApiService?: ImportApiServiceAbstraction } & CachedServices,
  opts: ImportApiServiceInitOptions
): Promise<ImportApiServiceAbstraction> {
  return factory(
    cache,
    "importApiService",
    opts,
    async () => new ImportApiService(await apiServiceFactory(cache, opts))
  );
}
