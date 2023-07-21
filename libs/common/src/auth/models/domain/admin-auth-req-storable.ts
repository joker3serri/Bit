import { Utils } from "../../../platform/misc/utils";

export class AdminAuthRequestStorable {
  id: string;
  privateKey: ArrayBuffer;

  constructor(init?: Partial<AdminAuthRequestStorable>) {
    if (init) {
      Object.assign(this, init);
    }
  }

  toJSON() {
    return {
      id: this.id,
      privateKey: Utils.fromBufferToByteString(this.privateKey),
    };
  }

  static fromJSON(obj: any): AdminAuthRequestStorable {
    if (obj == null) {
      return null;
    }

    let privateKeyBuffer = null;
    if (obj.privateKey) {
      privateKeyBuffer = Utils.fromByteStringToArray(obj.privateKey)?.buffer;
    }

    return new AdminAuthRequestStorable({
      id: obj.id,
      privateKey: privateKeyBuffer,
    });
  }
}
