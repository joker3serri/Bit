import { LogService } from "@bitwarden/common/abstractions/log.service";
import { LogLevelType } from "@bitwarden/common/enums/logLevelType";
import { ConsoleLogService } from "@bitwarden/common/services/consoleLog.service";

type LogServiceFactoryOptions = {
  isDev: boolean;
  filter?: (level: LogLevelType) => boolean;
  logService?: LogService;
};

export type LogServiceInitOptions = LogServiceFactoryOptions;

export function logServiceFactory(opts: LogServiceInitOptions): LogService {
  if (!opts.logService) {
    opts.logService = new ConsoleLogService(opts.isDev, opts.filter);
  }
  return opts.logService;
}
