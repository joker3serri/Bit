import { program, Command } from "commander";

import { ServiceContainer } from "../../service-container";

import { ApproveAllCommand } from "./approve-all.command";
import { ApproveCommand } from "./approve.command";
import { DenyAllCommand } from "./deny-all.command";
import { DenyCommand } from "./deny.command";
import { ListCommand } from "./list.command";

export class DeviceApprovalProgram {
  constructor(private serviceContainer: ServiceContainer) {}

  register() {
    program.addCommand(this.deviceApprovalCommand());
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
        const listCommand = new ListCommand();
        await listCommand.run();
      });
  }

  private approveCommand(): Command {
    return new Command("approve")
      .argument("<id>")
      .description("Approve a pending request")
      .action(async () => {
        const cmd = new ApproveCommand();
        await cmd.run();
      });
  }

  private approveAllCommand(): Command {
    return new Command("approveAll")
      .description("Approve all pending requests for an organization")
      .argument("<organizationId>")
      .action(async () => {
        const cmd = new ApproveAllCommand();
        await cmd.run();
      });
  }

  private denyCommand(): Command {
    return new Command("deny")
      .argument("<id>")
      .description("Deny a pending request")
      .action(async () => {
        const cmd = new DenyCommand();
        await cmd.run();
      });
  }

  private denyAllCommand(): Command {
    return new Command("denyAll")
      .description("Deny all pending requests for an organization")
      .argument("<organizationId>")
      .action(async () => {
        const cmd = new DenyAllCommand();
        await cmd.run();
      });
  }
}
