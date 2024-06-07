import { RegisterSendVerificationEmailRequest } from "../models/request/registration/register-send-verification-email.request";
import { Verification } from "../types/verification";

export abstract class AccountApiService {
  abstract deleteAccount(verification: Verification): Promise<void>;
  abstract registerSendVerificationEmail(
    request: RegisterSendVerificationEmailRequest,
  ): Promise<null | string>;
}
