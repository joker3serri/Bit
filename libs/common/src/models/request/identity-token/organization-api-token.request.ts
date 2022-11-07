import { TokenRequest } from "./token.request";

export class OrganizationApiTokenRequest extends TokenRequest {
  constructor(public clientId: string, public clientSecret: string) {
    super(null);
  }

  toIdentityToken() {
    const obj = super.toIdentityToken(this.clientId);

    obj.scope = "api.organization";
    obj.grant_type = "client_credentials";
    obj.client_secret = this.clientSecret;

    return obj;
  }
}
