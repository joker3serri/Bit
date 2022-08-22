import { ServerConfigResponse } from "@bitwarden/common/models/response/serverConfigResponse";

export class ConfigApiServiceAbstraction {
  get: () => Promise<ServerConfigResponse>;
}
