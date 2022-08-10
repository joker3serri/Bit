import { Observable } from "rxjs";

import { ServerConfig } from "./ServerConfig";

export abstract class ConfigService {
  serverConfig$: Observable<ServerConfig>;
}
