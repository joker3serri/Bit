import { Account } from "./account";
import { ParserOptions } from "./parserOptions";
import { SharedFolder } from "./sharedFolder";

export class Parser {
  parseAcct(
    chunk: Chunk,
    encryptionKey: Uint8Array,
    folder: SharedFolder,
    options: ParserOptions
  ): Account {
    return null;
  }
}

class Chunk {
  id: string;
  payload: Uint8Array;
}
