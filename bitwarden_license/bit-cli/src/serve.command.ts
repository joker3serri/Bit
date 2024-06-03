import { ServeCommand as OssServeCommand } from "@bitwarden/cli/commands/serve.command";

import { ApproveAllCommand } from "./admin-console/device-approval/approve-all.command";
import { ApproveCommand } from "./admin-console/device-approval/approve.command";
import { DenyAllCommand } from "./admin-console/device-approval/deny-all.command";
import { DenyCommand } from "./admin-console/device-approval/deny.command";
import { ListCommand } from "./admin-console/device-approval/list.command";
import { ServiceContainer } from "./service-container";

export class ServeCommand extends OssServeCommand {
  private deviceApprovals: {
    list: ListCommand;
    approve: ApproveCommand;
    approveAll: ApproveAllCommand;
    deny: DenyCommand;
    denyAll: DenyAllCommand;
  };

  constructor(protected override serviceContainer: ServiceContainer) {
    super(serviceContainer);

    this.deviceApprovals = {
      list: ListCommand.create(serviceContainer),
      approve: ApproveCommand.create(serviceContainer),
      approveAll: ApproveAllCommand.create(serviceContainer),
      deny: DenyCommand.create(serviceContainer),
      denyAll: DenyAllCommand.create(serviceContainer),
    };
  }

  protected override configureServer(options: {
    protectOrigin: boolean;
    port: number;
    hostname: string;
  }): void {
    // Basic serve configuration and register OSS endpoints
    super.configureServer(options);

    // Register bit endpoints
    this.serveDeviceApprovals();
  }

  private serveDeviceApprovals() {
    this.router.get("/device-approvals/:organizationId", async (ctx, next) => {
      if (await this.errorIfLocked(ctx.response)) {
        await next();
        return;
      }

      const response = await this.deviceApprovals.list.run(ctx.params.organizationId);
      this.processResponse(ctx.response, response);
      await next();
    });

    this.router.post("/device-approvals/:organizationId/approve-all", async (ctx, next) => {
      if (await this.errorIfLocked(ctx.response)) {
        await next();
        return;
      }

      const response = await this.deviceApprovals.approveAll.run(ctx.params.organizationId);
      this.processResponse(ctx.response, response);
      await next();
    });

    this.router.post("/device-approvals/:organizationId/approve/:requestId", async (ctx, next) => {
      if (await this.errorIfLocked(ctx.response)) {
        await next();
        return;
      }

      const response = await this.deviceApprovals.approve.run(ctx.params.organizationId);
      this.processResponse(ctx.response, response);
      await next();
    });

    this.router.post("/device-approvals/:organizationId/deny-all", async (ctx, next) => {
      if (await this.errorIfLocked(ctx.response)) {
        await next();
        return;
      }

      const response = await this.deviceApprovals.denyAll.run(ctx.params.organizationId);
      this.processResponse(ctx.response, response);
      await next();
    });

    this.router.post("/device-approvals/:organizationId/deny/:requestId", async (ctx, next) => {
      if (await this.errorIfLocked(ctx.response)) {
        await next();
        return;
      }

      const response = await this.deviceApprovals.deny.run(
        ctx.params.organizationId,
        ctx.params.requestId,
      );
      this.processResponse(ctx.response, response);
      await next();
    });
  }
}
