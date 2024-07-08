import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { Utils } from "@bitwarden/common/platform/misc/utils";

import { IntegrationMetadata } from "./integration-metadata";
import { ApiSettings, SelfHostedApiSettings, RequestOptions } from "./rpc";

/** Utilities for processing integration settings */
export class IntegrationContext {
  constructor(
    readonly configuration: IntegrationMetadata,
    protected i18nService: I18nService,
  ) {}

  /** look up a service API's baseURL */
  baseUrl(settings?: ApiSettings | SelfHostedApiSettings) {
    // normalize baseUrl
    const baseUrl = settings && "baseUrl" in settings ? settings.baseUrl : "";

    // handle boolean cases
    if (this.configuration.selfHost === "never") {
      return this.configuration.baseUrl;
    } else if (this.configuration.selfHost === "always" && baseUrl === "") {
      const error = this.i18nService.t("forwarderNoUrl", this.configuration.name);
      throw error;
    }

    // otherwise setting overrides baseUrl
    return baseUrl.length > 0 ? baseUrl : this.configuration.baseUrl;
  }

  /** look up a service API's authentication token */
  authenticationToken(settings: ApiSettings, options: { base64?: boolean } = null) {
    if (!settings.token || settings.token === "") {
      const error = this.i18nService.t("forwaderInvalidToken", this.configuration.name);
      throw error;
    }

    let token = settings.token;
    if (options?.base64) {
      token = Utils.fromUtf8ToB64(token);
    }

    return token;
  }

  /** get descriptive text describing the generated credential */
  website(request: RequestOptions) {
    return request.website ?? "";
  }

  /** get descriptive text describing the generated credential */
  generatedBy(request: RequestOptions) {
    const website = this.website(request);

    const descriptionId =
      website === "" ? "forwarderGeneratedBy" : "forwarderGeneratedByWithWebsite";
    const description = this.i18nService.t(descriptionId, website);

    return description;
  }
}
