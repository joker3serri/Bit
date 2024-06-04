import { ServeCommand as OssServeCommand } from "@bitwarden/cli/commands/serve.command";

import {
  ApproveAllCommand,
  ApproveCommand,
  DenyAllCommand,
  DenyCommand,
  ListCommand,
} from "./admin-console/device-approval";
import { ServiceContainer } from "./service-container";

export class ServeCommand extends OssServeCommand {
  constructor(protected override serviceContainer: ServiceContainer) {
    super(serviceContainer);
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
    this.router.get("/device-approval/:organizationId", async (ctx, next) => {
      if (await this.errorIfLocked(ctx.response)) {
        await next();
        return;
      }

      const response = await ListCommand.create(this.serviceContainer).run(
        ctx.params.organizationId,
      );
      this.processResponse(ctx.response, response);
      await next();
    });

    this.router.post("/device-approval/:organizationId/approve-all", async (ctx, next) => {
      if (await this.errorIfLocked(ctx.response)) {
        await next();
        return;
      }

      const response = await ApproveAllCommand.create(this.serviceContainer).run(
        ctx.params.organizationId,
      );
      this.processResponse(ctx.response, response);
      await next();
    });

    this.router.post("/device-approval/:organizationId/approve/:requestId", async (ctx, next) => {
      if (await this.errorIfLocked(ctx.response)) {
        await next();
        return;
      }

      const response = await ApproveCommand.create(this.serviceContainer).run(
        ctx.params.organizationId,
        ctx.params.requestId,
      );
      this.processResponse(ctx.response, response);
      await next();
    });

    this.router.post("/device-approval/:organizationId/deny-all", async (ctx, next) => {
      if (await this.errorIfLocked(ctx.response)) {
        await next();
        return;
      }

      const response = await DenyAllCommand.create(this.serviceContainer).run(
        ctx.params.organizationId,
      );
      this.processResponse(ctx.response, response);
      await next();
    });

    this.router.post("/device-approval/:organizationId/deny/:requestId", async (ctx, next) => {
      if (await this.errorIfLocked(ctx.response)) {
        await next();
        return;
      }

      const response = await DenyCommand.create(this.serviceContainer).run(
        ctx.params.organizationId,
        ctx.params.requestId,
      );
      this.processResponse(ctx.response, response);
      await next();
    });
  }
}
