export class UserType {
  /*
    Type values
    0 = Master Password
    3 = Federated
    */
  type: number;
  IdentityProviderGUID: string;
  IdentityProviderURL: string;
  OpenIDConnectAuthority: string;
  OpenIDConnectClientId: string;
  CompanyId: number;
  /*
    Provider Values
    0 = LastPass/Azure AD?
    1 = Okta with auth server
    2 = Okta without auth server
    3 = Google Workspace
    */
  Provider: number;
  PkceEnabled: boolean;
  IsPasswordlessEnabled: boolean;

  isFederated(): boolean {
    return (
      this.type === 3 &&
      this.hasValue(this.IdentityProviderURL) &&
      this.hasValue(this.OpenIDConnectAuthority) &&
      this.hasValue(this.OpenIDConnectClientId)
    );
  }

  private hasValue(str: string) {
    return str != null && str.trim() !== "";
  }
}
