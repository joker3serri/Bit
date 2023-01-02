import { BaseResponse } from "./base.response";
import { CipherResponse } from "./cipher.response";
import { CollectionResponse } from "./collection.response";

export class OrganizationExportResponse extends BaseResponse {
  collections: CollectionResponse[];
  ciphers: CipherResponse[];

  constructor(response: any) {
    super(response);
    const collections = this.getResponseProperty("Collections");
    if (collections.data != null) {
      this.collections = collections.data.map((c: any) => new CollectionResponse(c));
    }
    const ciphers = this.getResponseProperty("Ciphers");
    if (ciphers.data != null) {
      this.ciphers = ciphers.data.map((c: any) => new CipherResponse(c));
    }
  }
}
