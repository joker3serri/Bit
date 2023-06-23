import { ApiService } from "../../../../abstractions/api.service";

import { Forwarder } from "./forwarder";
import { ForwarderOptions } from "./forwarder-options";

export class AnonAddyForwarder implements Forwarder {
  async generate(apiService: ApiService, options: ForwarderOptions): Promise<string> {
    if (options.apiKey == null || options.apiKey === "") {
      throw "Invalid AnonAddy API token.";
    }
    if (options.anonaddy?.domain == null || options.anonaddy.domain === "") {
      throw "Invalid AnonAddy domain.";
    }
    const requestInit: RequestInit = {
      redirect: "manual",
      cache: "no-store",
      method: "POST",
      headers: new Headers({
        Authorization: "Bearer " + options.apiKey,
        "Content-Type": "application/json",
        "X-Requested-With": "XMLHttpRequest",
      }),
    };
    const url = "https://app.anonaddy.com/api/v1/aliases";
    requestInit.body = JSON.stringify({
      domain: options.anonaddy.domain,
      description:
        (options.website != null ? "Website: " + options.website + ". " : "") +
        "Generated by Bitwarden.",
    });
    const request = new Request(url, requestInit);
    const response = await apiService.nativeFetch(request);
    if (response.status === 200 || response.status === 201) {
      const json = await response.json();
      return json?.data?.email;
    }
    if (response.status === 401) {
      throw "Invalid AnonAddy API token.";
    }
    throw "Unknown AnonAddy error occurred.";
  }
}
