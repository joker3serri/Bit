import { StateFactory } from "@bitwarden/common/factories/stateFactory";
import { GlobalState } from "@bitwarden/common/models/domain/globalState";
import { StateMigrationService } from "@bitwarden/common/services/stateMigration.service";

import { Account } from "../../models/account";

import {
  diskStorageServiceFactory,
  DiskStorageServiceInitOptions,
  secureStorageServiceFactory,
  SecureStorageServiceInitOptions,
} from "./storage-service.factory";

type StateMigrationServiceFactoryOptions = {
  stateFactory: StateFactory<GlobalState, Account>;
  stateMigrationService?: StateMigrationService;
};

export type StateMigrationServiceInitOptions = StateMigrationServiceFactoryOptions &
  DiskStorageServiceInitOptions &
  SecureStorageServiceInitOptions;

export function stateMigrationServiceFactory(
  opts: StateMigrationServiceInitOptions
): StateMigrationService {
  if (!opts.stateMigrationService) {
    opts.stateMigrationService = new StateMigrationService(
      diskStorageServiceFactory(opts),
      secureStorageServiceFactory(opts),
      opts.stateFactory
    );
  }
  return opts.stateMigrationService;
}
