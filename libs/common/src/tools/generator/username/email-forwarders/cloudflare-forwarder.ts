import { ApiService } from "../../../../abstractions/api.service";

import { Forwarder } from "./forwarder";
import { ForwarderOptions } from "./forwarder-options";

export class CloudflareForwarder implements Forwarder {
  async generate(apiService: ApiService, options: ForwarderOptions): Promise<string> {
    if (options.apiKey == null || options.apiKey === "") {
      throw "Invalid Cloudflare API token.";
    } else if (options.cloudflare.accountId == null || options.cloudflare.accountId === "") {
      throw "Invalid Cloudflare account ID.";
    } else if (options.cloudflare.zoneId == null || options.cloudflare.zoneId === "") {
      throw "Invalid Cloudflare zone ID.";
    } else if (options.cloudflare.alias == null || options.cloudflare.alias === "") {
      throw "Invalid Cloudflare domain.";
    }

    const generatedEmail = options.cloudflare.startString + "@" + options.cloudflare.alias;

    const requestInit: RequestInit = {
      redirect: "manual",
      cache: "no-store",
      method: "POST",
      headers: new Headers({
        authorization: "Bearer " + options.apiKey,
        "Content-Type": "application/json",
      }),
    };
    const url = `https://api.cloudflare.com/client/v4/zones/${options.cloudflare.zoneId}/email/routing/rules`;
    requestInit.body = JSON.stringify({
      actions: [
        {
          type: "forward",
          value: [options.cloudflare.recipient],
        },
      ],
      enabled: true,
      matchers: [
        {
          field: "to",
          type: "literal",
          value: generatedEmail,
        },
      ],
      name:
        "Forwarder for " +
        generatedEmail +
        " to " +
        options.cloudflare.recipient +
        " created by Bitwarden.",
      priority: 0,
    });
    const request = new Request(url, requestInit);
    const response = await apiService.nativeFetch(request);

    if (response.status === 200 || response.status === 201) {
      return generatedEmail;
    } else if (response.status === 400) {
      throw "Invalid Cloudflare API token.";
    } else if (response.status === 404) {
      throw "Cloudflare could not route the request.";
    } else if (response.status == 409) {
      throw "Duplicate email forwarder.";
    } else if (response?.statusText != null) {
      throw "Cloudflare error:\n" + response.statusText;
    }
    throw "Unknown Cloudflare error occurred.";
  }
}
