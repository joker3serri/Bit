import { BrowserEnvironmentService } from "../../services/browser-environment.service";

import { factory, FactoryOptions } from "./factory-options";
import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import {
  stateServiceFactory as stateServiceFactory,
  StateServiceInitOptions,
} from "./state-service.factory";

type EnvironmentServiceFactoryOptions = FactoryOptions & {
  instances: {
    environmentService?: BrowserEnvironmentService;
  };
};

export type EnvironmentServiceInitOptions = EnvironmentServiceFactoryOptions &
  StateServiceInitOptions &
  LogServiceInitOptions;

export function environmentServiceFactory(
  opts: EnvironmentServiceInitOptions
): BrowserEnvironmentService {
  return factory(
    opts,
    "environmentService",
    () => new BrowserEnvironmentService(stateServiceFactory(opts), logServiceFactory(opts))
  );
}
