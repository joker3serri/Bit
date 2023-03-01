import { ProviderUserType } from "../../../../admin-console/enums/providerUserType";

export class ProviderUserInviteRequest {
  emails: string[] = [];
  type: ProviderUserType;
}
