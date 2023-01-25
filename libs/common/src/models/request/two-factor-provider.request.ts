import { TwoFactorProviderType } from "../../auth/enums/two-factor-provider-type";
import { SecretVerificationRequest } from "../../auth/models/request/secret-verification.request";

export class TwoFactorProviderRequest extends SecretVerificationRequest {
  type: TwoFactorProviderType;
}
