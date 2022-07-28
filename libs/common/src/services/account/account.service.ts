import { ApiService } from "@bitwarden/common/abstractions/api.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { MessagingService } from "@bitwarden/common/abstractions/messaging.service";
import { UserVerificationService } from "@bitwarden/common/abstractions/userVerification.service";

import { AccountService as AccountServiceAbstraction } from "../../abstractions/account/account.service.abstraction";
import { Verification } from "../../types/verification";

export class AccountService implements AccountServiceAbstraction {
  constructor(
    private apiService: ApiService,
    private userVerificationService: UserVerificationService,
    private messagingService: MessagingService,
    private logService: LogService
  ) {}

  async delete(verification: Verification): Promise<any> {
    try {
      const verificationRequest = await this.userVerificationService.buildRequest(verification);
      await this.apiService.deleteAccount(verificationRequest);
      this.messagingService.send("logout");
    } catch (e) {
      this.logService.error(e);
      throw e;
    }
  }
}
