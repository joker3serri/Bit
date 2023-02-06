import { BaseResponse } from "@bitwarden/common/models/response/base.response";

export class PotentialGranteeResponse extends BaseResponse {
  id: string;
  name: string;
  type: string;
  email: string;

  constructor(response: any) {
    super(response);
    this.id = this.getResponseProperty("Id");
    this.name = this.getResponseProperty("Name");
    this.type = this.getResponseProperty("Type");
    this.email = this.getResponseProperty("Email");
  }
}
