import { ProviderSetupRequest } from "../../models/request/provider/provider-setup.request";
import { ProviderUpdateRequest } from "../../models/request/provider/provider-update.request";
import { ProviderVerifyDeleteRecoverRequest } from "../../models/request/provider/provider-verify-delete-recover.request";
import { ProviderResponse } from "../../models/response/provider/provider.response";

export class ProviderApiServiceAbstraction {
  postProviderSetup: (id: string, request: ProviderSetupRequest) => Promise<ProviderResponse>;
  getProvider: (id: string) => Promise<ProviderResponse>;
  putProvider: (id: string, request: ProviderUpdateRequest) => Promise<ProviderResponse>;
  providerRecoverDeleteToken: (
    organizationId: string,
    request: ProviderVerifyDeleteRecoverRequest,
  ) => Promise<any>;
  deleteProvider: (id: string) => Promise<void>;
}
