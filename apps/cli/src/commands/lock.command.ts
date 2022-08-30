import { VaultTimeoutActionService } from "@bitwarden/common/abstractions/vaultTimeout/vaultTimeoutAction.service";
import { Response } from "@bitwarden/node/cli/models/response";
import { MessageResponse } from "@bitwarden/node/cli/models/response/messageResponse";

export class LockCommand {
  constructor(private vaultTimeoutActionService: VaultTimeoutActionService) {}

  async run() {
    await this.vaultTimeoutActionService.lock();
    process.env.BW_SESSION = null;
    const res = new MessageResponse("Your vault is locked.", null);
    return Response.success(res);
  }
}
