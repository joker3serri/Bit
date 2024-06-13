import { RegisterSendVerificationEmailRequest } from "../models/request/registration/register-send-verification-email.request";
import { Verification } from "../types/verification";

export abstract class AccountApiService {
  /**
   * Deletes an account based on the provided verification information.
   *
   * @param {Verification} verification - The verification object containing information
   * required to authorize the account deletion.
   * @returns {Promise<void>} A promise that resolves when the account is successfully deleted.
   */
  abstract deleteAccount(verification: Verification): Promise<void>;

  /**
   * Sends a verification email as part of the registration process.
   *
   * @param {RegisterSendVerificationEmailRequest} request - The request object containing
   * information needed to send the verification email, such as the user's email address.
   * @returns {Promise<null | string>} A promise that resolves to a string token
   * containing the user's encrypted information which must be submitted to complete registration
   * or `null` if email verification is enabled (users must get the token by clicking a link in the email that will be sent to them).
   */
  abstract registerSendVerificationEmail(
    request: RegisterSendVerificationEmailRequest,
  ): Promise<null | string>;
}
