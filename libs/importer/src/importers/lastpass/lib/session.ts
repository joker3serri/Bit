import { Platform } from "./platform";

export interface Session {
  id: string;
  keyIterationCount: number;
  token: string;
  platform: Platform;
  encryptedPrivateKey: string;
}
