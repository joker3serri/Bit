import { BehaviorSubject } from "rxjs";

import { ServerConfig } from "@bitwarden/common/platform/abstractions/config/server-config";
import { ConfigService } from "@bitwarden/common/platform/services/config/config.service";

import { browserSession, sessionSync } from "../platform/decorators/session-sync-observable";

@browserSession
export class BrowserConfigService extends ConfigService {
  @sessionSync<ServerConfig>({ initializer: ServerConfig.fromJSON })
  protected _serverConfig: BehaviorSubject<ServerConfig | null>;
}
