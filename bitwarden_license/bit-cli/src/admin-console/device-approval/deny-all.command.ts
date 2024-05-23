import { Response } from "@bitwarden/cli/models/response";

export class DenyAllCommand {
  constructor() {}

  async run(): Promise<Response> {
    throw new Error("Not implemented");
  }
}
