export class DenyAllCommand {
  constructor() {}

  async run() {
    throw new Error("Not implemented");
  }
}
