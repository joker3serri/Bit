import { LogService } from "@bitwarden/common/abstractions/log.service";
import { LogLevelType } from "@bitwarden/common/enums/logLevelType";
import { ConsoleLogService } from "@bitwarden/common/services/consoleLog.service";

import { factory, FactoryOptions } from "./factory-options";

type LogServiceFactoryOptions = FactoryOptions & {
  isDev: boolean;
  filter?: (level: LogLevelType) => boolean;
  instances: {
    logService?: LogService;
  };
};

export type LogServiceInitOptions = LogServiceFactoryOptions;

export function logServiceFactory(opts: LogServiceInitOptions): LogService {
  return factory(opts, "logService", () => new ConsoleLogService(opts.isDev, opts.filter));
}
