// @ts-strict-ignore
import { SecretVerificationRequest } from "./secretVerificationRequest";

export class TwoFactorRecoveryRequest extends SecretVerificationRequest {
  recoveryCode: string;
  email: string;
}
