import { Account } from "./account";
import { ParserOptions } from "./parserOptions";
import { SharedFolder } from "./sharedFolder";

export class Parser {
  async parseAcct(
    chunk: Chunk,
    encryptionKey: Uint8Array,
    folder: SharedFolder,
    options: ParserOptions
  ): Promise<Account> {
    return null;
  }
}

export class Chunk {
  id: string;
  payload: Uint8Array;
}
