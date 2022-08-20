// @ts-strict-ignore
import { SecretVerificationRequest } from "./secretVerificationRequest";

export class UpdateTwoFactorAuthenticatorRequest extends SecretVerificationRequest {
  token: string;
  key: string;
}
