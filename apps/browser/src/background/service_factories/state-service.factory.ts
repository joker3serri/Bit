import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/globalState";

import { Account } from "../../models/account";
import { StateService } from "../../services/state.service";

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

type StateServiceFactoryOptions = {
  stateService?: StateService;
  useAccountCache?: boolean;
  stateFactory: StateFactory<GlobalState, Account>;
};

export type StateServiceInitOptions = StateServiceFactoryOptions &
  DiskStorageServiceInitOptions &
  SecureStorageServiceInitOptions &
  MemoryStorageServiceInitOptions &
  LogServiceInitOptions &
  StateMigrationServiceInitOptions;

export function stateServiceFactory(opts: StateServiceInitOptions): StateService {
  if (!opts.stateService) {
    opts.stateService = new StateService(
      diskStorageServiceFactory(opts),
      secureStorageServiceFactory(opts),
      memoryStorageServiceFactory(opts),
      logServiceFactory(opts),
      stateMigrationServiceFactory(opts),
      opts.stateFactory,
      opts.useAccountCache
    );
  }
  return opts.stateService;
}
