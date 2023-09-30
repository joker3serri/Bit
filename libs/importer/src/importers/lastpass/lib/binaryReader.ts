export class BinaryReader {
  private arr: Uint8Array;
  private position: number;
  private isLittleEndian: boolean;

  constructor(arr: Uint8Array) {
    this.arr = arr;
    this.position = 0;

    const uInt32 = new Uint32Array([0x11223344]);
    const uInt8 = new Uint8Array(uInt32.buffer);
    this.isLittleEndian = uInt8[0] === 0x44;
  }

  readBytes(count: number): Uint8Array {
    if (this.position + count > this.arr.length) {
      throw "End of array reached";
    }
    const slice = this.arr.subarray(this.position, this.position + count);
    this.position += count;
    return slice;
  }

  readUInt16(): number {
    const slice = this.readBytes(2);
    return slice[0] | (slice[1] << 8);
  }

  readUInt32(): number {
    const slice = this.readBytes(4);
    return slice[0] | (slice[1] << 8) | (slice[2] << 16) | (slice[3] << 24);
  }

  readUInt16BigEndian(): number {
    let result = this.readUInt16();
    if (this.isLittleEndian) {
      result = (result << 8) | (result >> 8);
    }
    return result;
  }

  readUInt32BigEndian(): number {
    let result = this.readUInt32();
    if (this.isLittleEndian) {
      result =
        ((result & 0x000000ff) << 24) |
        ((result & 0x0000ff00) << 8) |
        ((result & 0x00ff0000) >> 8) |
        ((result & 0xff000000) >> 24);
    }
    return result;
  }

  seek(position: number) {
    if (position > this.arr.length) {
      throw "Array not loarge enough";
    }
    this.position = position;
  }

  atEnd(): boolean {
    return this.position >= this.arr.length - 1;
  }
}
