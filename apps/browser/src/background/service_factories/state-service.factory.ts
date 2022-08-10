import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/globalState";

import { Account } from "../../models/account";
import { StateService } from "../../services/state.service";

import { factory, FactoryOptions } from "./factory-options";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import {
  stateMigrationServiceFactory,
  StateMigrationServiceInitOptions,
} from "./state-migration-service.factory";
import {
  diskStorageServiceFactory,
  secureStorageServiceFactory,
  memoryStorageServiceFactory,
  DiskStorageServiceInitOptions,
  SecureStorageServiceInitOptions,
  MemoryStorageServiceInitOptions,
} from "./storage-service.factory";

type StateServiceFactoryOptions = FactoryOptions & {
  useAccountCache?: boolean;
  stateFactory: StateFactory<GlobalState, Account>;
  instances: {
    stateService?: StateService;
  };
};

export type StateServiceInitOptions = StateServiceFactoryOptions &
  DiskStorageServiceInitOptions &
  SecureStorageServiceInitOptions &
  MemoryStorageServiceInitOptions &
  LogServiceInitOptions &
  StateMigrationServiceInitOptions;

export function stateServiceFactory(opts: StateServiceInitOptions): StateService {
  return factory(
    opts,
    "stateService",
    () =>
      new StateService(
        diskStorageServiceFactory(opts),
        secureStorageServiceFactory(opts),
        memoryStorageServiceFactory(opts),
        logServiceFactory(opts),
        stateMigrationServiceFactory(opts),
        opts.stateFactory,
        opts.useAccountCache
      )
  );
}
