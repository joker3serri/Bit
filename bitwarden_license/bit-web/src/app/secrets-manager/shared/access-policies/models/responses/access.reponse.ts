import { BaseResponse } from "@bitwarden/common/models/response/base.response";

export class AccessResponse extends BaseResponse {
  read: boolean;
  write: boolean;

  constructor(response: any) {
    super(response);
    this.read = this.getResponseProperty("Read");
    this.write = this.getResponseProperty("Write");
  }
}
