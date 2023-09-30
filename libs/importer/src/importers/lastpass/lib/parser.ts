import { Utils } from "@bitwarden/common/platform/misc/utils";

import { Account } from "./account";
import { BinaryReader } from "./binaryReader";
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

  extractChunks(reader: BinaryReader): Chunk[] {
    const chunks = new Array<Chunk>();
    while (!reader.atEnd()) {
      const chunk = this.readChunk(reader);
      chunks.push(chunk);

      // TODO: catch end of stream exception?
      // In case the stream is truncated we just ignore the incomplete chunk.
    }
    return chunks;
  }

  private readChunk(reader: BinaryReader): Chunk {
    /*
    LastPass blob chunk is made up of 4-byte ID, big endian 4-byte size and payload of that size
    Example:
      0000: 'IDID'
      0004: 4
      0008: 0xDE 0xAD 0xBE 0xEF
      000C: --- Next chunk ---
    */
    const chunk = new Chunk();
    chunk.id = this.readId(reader);
    chunk.payload = this.readPayload(reader, this.readSize(reader));
    return chunk;
  }

  private readItem(reader: BinaryReader): Uint8Array {
    /*
    An item in an itemized chunk is made up of the big endian size and the payload of that size
    Example:
      0000: 4
      0004: 0xDE 0xAD 0xBE 0xEF
      0008: --- Next item ---
    See readItem for item description.
    */
    return this.readPayload(reader, this.readSize(reader));
  }

  private skipItem(reader: BinaryReader): void {
    // See readItem for item description.
    reader.seek(this.readSize(reader));
  }

  private readId(reader: BinaryReader): string {
    return Utils.fromBufferToUtf8(reader.readBytes(4));
  }

  private readSize(reader: BinaryReader): number {
    return reader.readUInt32BigEndian();
  }

  private readPayload(reader: BinaryReader, size: number): Uint8Array {
    return reader.readBytes(size);
  }
}

export class Chunk {
  id: string;
  payload: Uint8Array;
}
