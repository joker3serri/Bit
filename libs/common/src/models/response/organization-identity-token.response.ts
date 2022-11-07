import { BaseResponse } from "./base.response";

export class OrganizationIdentityTokenResponse extends BaseResponse {
  accessToken: string;
  expiresIn: number;
  refreshToken: string;
  tokenType: string;

  constructor(response: any) {
    super(response);
    this.accessToken = response.access_token;
    this.expiresIn = response.expires_in;
    this.refreshToken = response.refresh_token;
    this.tokenType = response.token_type;
  }
}
