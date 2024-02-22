import { AuthRequestResponse } from "@bitwarden/common/auth/models/response/auth-request.response";

export abstract class AuthRequestServiceAbstraction {
  abstract approveOrDenyAuthRequest: (
    approve: boolean,
    authRequest: AuthRequestResponse,
  ) => Promise<AuthRequestResponse>;
}
