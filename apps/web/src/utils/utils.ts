import { FlagName, Flags } from "./flags";

export class WebUtils {
  static flagEnabled(flag: FlagName) {
    return this.flags[flag] == null || this.flags[flag];
  }

  private static get flags(): Flags {
    const envFlags = process.env.FLAGS as string | Flags;

    if (typeof envFlags === "string") {
      return JSON.parse(envFlags) as Flags;
    } else {
      return envFlags as Flags;
    }
  }
}
