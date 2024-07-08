import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { JsonRpc } from "./rpc";

/** Makes remote procedure calls using a RESTful interface. */
export abstract class RestClient {
  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
  ) {}
  /** uses the fetch API to request a JSON payload. */
  async fetchJson<Parameters, Response>(
    rpc: JsonRpc<Parameters, Response>,
    params: Parameters,
  ): Promise<Response> {
    const request = rpc.toRequest(params);
    const response = await this.apiService.nativeFetch(request);

    let error = "forwarderUnknownError";
    let cause: string = undefined;

    if (response.status === 401 || response.status === 403) {
      cause = await this.tryGetErrorMessage(response);
      error = cause ? "forwaderInvalidTokenWithMessage" : "forwaderInvalidToken";
    } else if (response.status % 500 === 1) {
      cause = await this.tryGetErrorMessage(response);
      cause = cause ?? response.statusText;
    }

    let ok: Response = undefined;
    if (rpc.hasJsonPayload(response)) {
      [ok, cause] = rpc.processJson(await response.json());
    }

    if (ok) {
      return ok;
    } else if (cause) {
      error = "forwarderError";
    }

    throw this.i18nService.t(error, rpc.requestor.name, cause);
  }

  private async tryGetErrorMessage(response: Response) {
    const body = (await response.text()) ?? "";

    if (!body.startsWith("{")) {
      return undefined;
    }

    const json = JSON.parse(body);
    if ("error" in json) {
      return json.error;
    } else if ("message" in json) {
      return json.message;
    }

    return undefined;
  }
}
