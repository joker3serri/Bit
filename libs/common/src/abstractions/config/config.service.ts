import { Observable } from "rxjs";

import { ServerConfig } from "./serverConfig";

export abstract class ConfigService {
  serverConfig$: Observable<ServerConfig>;
}
