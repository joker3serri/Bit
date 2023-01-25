import { TwoFactorProviderType } from "../../auth/enums/twoFactorProviderType";

import { SecretVerificationRequest } from "./secret-verification.request";

export class TwoFactorProviderRequest extends SecretVerificationRequest {
  type: TwoFactorProviderType;
}
