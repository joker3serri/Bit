import { BrowserEnvironmentService } from "../../services/browser-environment.service";

import { logServiceFactory, LogServiceInitOptions } from "./log-service.factory";
import {
  stateServiceFactory as stateServiceFactory,
  StateServiceInitOptions,
} from "./state-service.factory";

type EnvironmentServiceFactoryOptions = {
  environmentService?: BrowserEnvironmentService;
};

export type EnvironmentServiceInitOptions = EnvironmentServiceFactoryOptions &
  StateServiceInitOptions &
  LogServiceInitOptions;

export function environmentServiceFactory(
  opts: EnvironmentServiceInitOptions
): BrowserEnvironmentService {
  if (!opts.environmentService) {
    opts.environmentService = new BrowserEnvironmentService(
      stateServiceFactory(opts),
      logServiceFactory(opts)
    );
  }
  return opts.environmentService;
}
