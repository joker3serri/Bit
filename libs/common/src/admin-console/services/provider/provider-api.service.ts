import { ApiService } from "../../../abstractions/api.service";
import { ProviderApiServiceAbstraction } from "../../abstractions/provider/provider-api.service.abstraction";
import { ProviderVerifyDeleteRecoverRequest } from "../../models/request/provider/provider-verify-delete-recover.request";

export class ProviderApiService implements ProviderApiServiceAbstraction {
  constructor(private apiService: ApiService) {}
  providerRecoverDeleteToken(
    providerId: string,
    request: ProviderVerifyDeleteRecoverRequest,
  ): Promise<any> {
    return this.apiService.send(
      "POST",
      "/providers/" + providerId + "/delete-recover-token",
      request,
      false,
      false,
    );
  }

  async deleteProvider(id: string): Promise<void> {
    await this.apiService.send("DELETE", "/providers/" + id, null, true, false);
  }
}
