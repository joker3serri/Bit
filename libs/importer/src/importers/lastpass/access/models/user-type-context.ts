import { IdpProvider, LastpassLoginType } from "../enums";

export class UserTypeContext {
  type: LastpassLoginType;
  // TODO: camelCase these property names
  IdentityProviderGUID: string;
  IdentityProviderURL: string;
  OpenIDConnectAuthority: string;
  OpenIDConnectClientId: string;
  CompanyId: number;
  Provider: IdpProvider;
  PkceEnabled: boolean;
  IsPasswordlessEnabled: boolean;

  isFederated(): boolean {
    return (
      this.type === LastpassLoginType.Federated &&
      this.hasValue(this.IdentityProviderURL) &&
      this.hasValue(this.OpenIDConnectAuthority) &&
      this.hasValue(this.OpenIDConnectClientId)
    );
  }

  oidcScope(): string {
    let scope = "openid profile email";
    if (this.Provider === IdpProvider.PingOne) {
      scope += " lastpass";
    }
    return scope;
  }

  oidcAuthorityCleaned(): string {
    return this.OpenIDConnectAuthority.replace("/.well-known/openid-configuration", "");
  }

  private hasValue(str: string) {
    return str != null && str.trim() !== "";
  }
}
