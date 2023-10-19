import { IdpProvider, LastpassLoginType } from "../enums";

export class UserTypeContext {
  type: LastpassLoginType;
  identityProviderGUID: string;
  identityProviderURL: string;
  openIDConnectAuthority: string;
  openIDConnectClientId: string;
  companyId: number;
  provider: IdpProvider;
  pkceEnabled: boolean;
  isPasswordlessEnabled: boolean;

  isFederated(): boolean {
    return (
      this.type === LastpassLoginType.Federated &&
      this.hasValue(this.identityProviderURL) &&
      this.hasValue(this.openIDConnectAuthority) &&
      this.hasValue(this.openIDConnectClientId)
    );
  }

  private hasValue(str: string) {
    return str != null && str.trim() !== "";
  }
}
