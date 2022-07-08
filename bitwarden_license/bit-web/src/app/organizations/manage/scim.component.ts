import { Component, OnInit } from "@angular/core";
import { FormControl } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";

import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { EnvironmentService } from "@bitwarden/common/abstractions/environment.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationService } from "@bitwarden/common/abstractions/organization.service";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { OrganizationApiKeyType } from "@bitwarden/common/enums/organizationApiKeyType";
import { OrganizationConnectionType } from "@bitwarden/common/enums/organizationConnectionType";
import { ScimConfigApi } from "@bitwarden/common/models/api/scimConfigApi";
import { OrganizationApiKeyRequest } from "@bitwarden/common/models/request/organizationApiKeyRequest";
import { OrganizationConnectionRequest } from "@bitwarden/common/models/request/organizationConnectionRequest";
import { ScimConfigRequest } from "@bitwarden/common/models/request/scimConfigRequest";
import { ApiKeyResponse } from "@bitwarden/common/models/response/apiKeyResponse";
import { OrganizationConnectionResponse } from "@bitwarden/common/models/response/organizationConnectionResponse";

@Component({
  selector: "app-org-manage-scim",
  templateUrl: "scim.component.html",
})
export class ScimComponent implements OnInit {
  loading = true;
  organizationId: string;
  existingConnectionId: string;
  formPromise: Promise<any>;
  enabled = new FormControl(false);
  showScimSettings = false;

  endpointUrl: string;
  clientSecret: string;

  constructor(
    private route: ActivatedRoute,
    private apiService: ApiService,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private organizationService: OrganizationService,
    private environmentService: EnvironmentService
  ) {}

  async ngOnInit() {
    this.route.parent.parent.params.subscribe(async (params) => {
      this.organizationId = params.organizationId;
      await this.load(null);
    });
  }

  async load(response: OrganizationConnectionResponse<ScimConfigApi>) {
    let connection = response;
    if (connection === null) {
      connection = await this.apiService.getOrganizationConnection(
        this.organizationId,
        OrganizationConnectionType.Scim,
        ScimConfigApi
      );
    }
    this.existingConnectionId = connection?.id;
    if (connection != null && connection.config?.enabled) {
      this.showScimSettings = true;
      this.enabled.setValue(true);
      this.endpointUrl = connection.config.serviceUrl;
      await this.loadApiKey(null);
    } else {
      this.showScimSettings = false;
      this.enabled.setValue(false);
    }
    this.loading = false;
  }

  async loadApiKey(response: ApiKeyResponse) {
    if (response !== null) {
      this.clientSecret = response.apiKey;
      return;
    }
    const apiKeyRequest = new OrganizationApiKeyRequest();
    apiKeyRequest.type = OrganizationApiKeyType.Scim;
    apiKeyRequest.masterPasswordHash = "N/A";
    const apiKeyResponse = await this.apiService.postOrganizationApiKey(
      this.organizationId,
      apiKeyRequest
    );
    this.clientSecret = apiKeyResponse.apiKey;
  }

  async copyScimUrl() {
    this.platformUtilsService.copyToClipboard(this.endpointUrl);
  }

  async rotateScimKey() {
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("rotateScimKeyWarning"),
      this.i18nService.t("rotateScimKey"),
      this.i18nService.t("rotateKey"),
      this.i18nService.t("cancel"),
      "warning"
    );
    if (!confirmed) {
      return false;
    }

    const request = new OrganizationApiKeyRequest();
    request.type = OrganizationApiKeyType.Scim;
    request.masterPasswordHash = "N/A";
    this.formPromise = this.apiService.postOrganizationRotateApiKey(this.organizationId, request);

    try {
      const response = await this.formPromise;
      await this.loadApiKey(response);
      this.platformUtilsService.showToast("success", null, this.i18nService.t("scimApiKeyRotated"));
    } catch {
      // Logged by appApiAction, do nothing
    }

    this.formPromise = null;
  }

  async copyScimKey() {
    this.platformUtilsService.copyToClipboard(this.clientSecret);
  }

  async submit() {
    try {
      const request = new OrganizationConnectionRequest(
        this.organizationId,
        OrganizationConnectionType.Scim,
        true,
        new ScimConfigRequest(this.enabled.value)
      );
      if (this.existingConnectionId == null) {
        this.formPromise = this.apiService.createOrganizationConnection(request, ScimConfigApi);
      } else {
        this.formPromise = this.apiService.updateOrganizationConnection(
          request,
          ScimConfigApi,
          this.existingConnectionId
        );
      }
      const response = (await this.formPromise) as OrganizationConnectionResponse<ScimConfigApi>;
      this.load(response);
      this.platformUtilsService.showToast("success", null, this.i18nService.t("scimSettingsSaved"));
    } catch (e) {
      // Logged by appApiAction, do nothing
    }

    this.formPromise = null;
  }
}
