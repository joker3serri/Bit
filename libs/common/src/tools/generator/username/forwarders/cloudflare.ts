import { ApiService } from "../../../../abstractions/api.service";
import { I18nService } from "../../../../platform/abstractions/i18n.service";
import { Forwarders } from "../options/constants";
import { Forwarder, CloudflareApiOptions } from "../options/forwarder-options";

/** Generates a forwarding address for Cloudflare */
export class CloudflareForwarder implements Forwarder {
  /** Instantiates the forwarder
   *  @param apiService used for ajax requests to the forwarding service
   *  @param i18nService used to look up error strings
   */
  constructor(
    private apiService: ApiService,
    private i18nService: I18nService,
  ) {}

  async generate(website: string | null, options: CloudflareApiOptions): Promise<string> {
    if (!options.token || options.token === "") {
      const error = this.i18nService.t("forwarderInvalidToken", Forwarders.Cloudflare.name);
      throw error;
    }

    const request = new Request(website, {
      redirect: "manual",
      cache: "no-store",
      method: "POST",
      headers: new Headers({
        Authorization: "Bearer " + options.token,
        "Content-Type": "application/json",
      }),
      body: JSON.stringify({
        actions: [
          {
            type: "forward",
            value: [options.recipient],
          },
        ],
        enabled: true,
        matchers: [
          {
            field: "to",
            type: "literal",
            value: options.email,
          },
        ],
        name: options.description,
        priority: 0,
      }),
    });

    const response = await this.apiService.nativeFetch(request);
    switch (response.status) {
      case 200: {
        const json = await response.json();
        return json?.data?.email;
      }
      case 400:
        throw this.i18nService.t("forwarderBadRequest", Forwarders.Cloudflare.name);
      case 404:
        throw this.i18nService.t("forwarderCouldNotRoute", Forwarders.Cloudflare.name);
      case 409:
        throw this.i18nService.t("forwarderDuplicateZoneRule", Forwarders.Cloudflare.name);
      default:
        throw this.i18nService.t("forwarderUnknownError", Forwarders.Cloudflare.name);
    }
  }
}
