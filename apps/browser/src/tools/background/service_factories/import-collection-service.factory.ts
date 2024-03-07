import {
  ImportCollectionService,
  ImportCollectionServiceAbstraction,
} from "../../../../../../libs/importer/src/services";
import {
  CachedServices,
  FactoryOptions,
  factory,
} from "../../../platform/background/service-factories/factory-options";
import {
  CollectionServiceInitOptions,
  collectionServiceFactory,
} from "../../../vault/background/service_factories/collection-service.factory";

export type ImportCollectionServiceInitOptions = FactoryOptions & CollectionServiceInitOptions;
type ServiceCache = {
  importCollectionService?: ImportCollectionServiceAbstraction;
} & CachedServices;

export function importCollectionServiceFactory(
  cache: ServiceCache,
  opts: ImportCollectionServiceInitOptions,
): Promise<ImportCollectionServiceAbstraction> {
  return factory(
    cache,
    "importCollectionService",
    opts,
    async () => new ImportCollectionService(await collectionServiceFactory(cache, opts)),
  );
}
