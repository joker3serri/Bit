import { ForwarderId } from "./username/options";
import { UsernameGeneratorType } from "./username/options/generator-options";

/** The kind of credential being generated. */
export type GeneratorType = "password" | "passphrase" | "username";

/** Stores credential generator UI state. */
export type GeneratorOptions = {
  /** The kind of credential being generated.
   * @remarks The legacy generator only supports "password" and "passphrase".
   *  The componentized generator supports all values.
   */
  type?: GeneratorType;

  /** When `type === "username"`, this stores the username algorithm. */
  username?: UsernameGeneratorType;

  /** When `username === "forwarded"`, this stores the forwarder implementation. */
  forwarder?: ForwarderId | "";
};

/** The default options for password generation. */
export const DefaultGeneratorOptions: Partial<GeneratorOptions> = Object.freeze({
  type: "password",
  username: "word",
  forwarder: "",
});
