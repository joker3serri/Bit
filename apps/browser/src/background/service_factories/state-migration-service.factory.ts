import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/globalState";
import { StateMigrationService } from "@bitwarden/common/services/stateMigration.service";

import { Account } from "../../models/account";

import { factory, FactoryOptions } from "./factory-options";
import {
  diskStorageServiceFactory,
  DiskStorageServiceInitOptions,
  secureStorageServiceFactory,
  SecureStorageServiceInitOptions,
} from "./storage-service.factory";

type StateMigrationServiceFactoryOptions = FactoryOptions & {
  stateFactory: StateFactory<GlobalState, Account>;
  instances: {
    stateMigrationService?: StateMigrationService;
  };
};

export type StateMigrationServiceInitOptions = StateMigrationServiceFactoryOptions &
  DiskStorageServiceInitOptions &
  SecureStorageServiceInitOptions;

export function stateMigrationServiceFactory(
  opts: StateMigrationServiceInitOptions
): StateMigrationService {
  return factory(
    opts,
    "stateMigrationService",
    () =>
      new StateMigrationService(
        diskStorageServiceFactory(opts),
        secureStorageServiceFactory(opts),
        opts.stateFactory
      )
  );
}
