import { Observable } from "rxjs";

import { ServerConfig } from "./server-config";

export abstract class ConfigService {
  serverConfig$: Observable<ServerConfig>;
}
