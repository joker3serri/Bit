import { ProviderVerifyDeleteRecoverRequest } from "../../models/request/provider/provider-verify-delete-recover.request";

export class ProviderApiServiceAbstraction {
  providerRecoverDeleteToken: (
    organizationId: string,
    request: ProviderVerifyDeleteRecoverRequest,
  ) => Promise<any>;
  deleteProvider: (id: string) => Promise<void>;
}
