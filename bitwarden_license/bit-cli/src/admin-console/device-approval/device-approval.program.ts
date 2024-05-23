import { program, Command } from "commander";
import { firstValueFrom } from "rxjs";

import { BaseProgram } from "@bitwarden/cli/base-program";
import { CliUtils } from "@bitwarden/cli/utils";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";

import { ApproveAllCommand } from "./approve-all.command";
import { ApproveCommand } from "./approve.command";
import { DenyAllCommand } from "./deny-all.command";
import { DenyCommand } from "./deny.command";
import { ListCommand } from "./list.command";



const writeLn = CliUtils.writeLn;

export class DeviceApprovalProgram extends BaseProgram {
  async register() {
    const enabled = await firstValueFrom(
      this.serviceContainer.configService.getFeatureFlag$(FeatureFlag.BulkDeviceApproval),
    );
    if (enabled) {
      program.addCommand(this.deviceApprovalCommand());
    } else {
      program.addCommand(this.noopDeviceApprovalCommand());
    }
  }

  private noopDeviceApprovalCommand() {
    return new Command("device-approval").description("Manage device approvals").action(() => {
      writeLn("This command is temporarily unavailable.");
    });
  }

  private deviceApprovalCommand() {
    return new Command("device-approval")
      .description("Manage device approvals")
      .addCommand(this.listCommand())
      .addCommand(this.approveCommand())
      .addCommand(this.approveAllCommand())
      .addCommand(this.denyCommand())
      .addCommand(this.denyAllCommand());
  }

  private listCommand(): Command {
    return new Command("list")
      .description("List all pending requests for an organization")
      .argument("<organizationId>")
      .action(async () => {
        await this.exitIfNotAuthed();

        const cmd = new ListCommand();
        const response = await cmd.run();
        this.processResponse(response);
      });
  }

  private approveCommand(): Command {
    return new Command("approve")
      .argument("<id>")
      .description("Approve a pending request")
      .action(async () => {
        await this.exitIfLocked();

        const cmd = new ApproveCommand();
        const response = await cmd.run();
        this.processResponse(response);
      });
  }

  private approveAllCommand(): Command {
    return new Command("approveAll")
      .description("Approve all pending requests for an organization")
      .argument("<organizationId>")
      .action(async () => {
        await this.exitIfLocked();

        const cmd = new ApproveAllCommand();
        const response = await cmd.run();
        this.processResponse(response);
      });
  }

  private denyCommand(): Command {
    return new Command("deny")
      .argument("<id>")
      .description("Deny a pending request")
      .action(async () => {
        await this.exitIfLocked();

        const cmd = new DenyCommand();
        const response = await cmd.run();
        this.processResponse(response);
      });
  }

  private denyAllCommand(): Command {
    return new Command("denyAll")
      .description("Deny all pending requests for an organization")
      .argument("<organizationId>")
      .action(async () => {
        await this.exitIfLocked();

        const cmd = new DenyAllCommand();
        const response = await cmd.run();
        this.processResponse(response);
      });
  }
}
