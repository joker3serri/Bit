import { BaseResponse } from "../../../../../../../libs/common/src/models/response/baseResponse";

export class SecretResponse extends BaseResponse {
  id: string;
  organizationId: string;
  key: string;
  value: string;
  note: string;
  creationDate: string;
  revisionDate: string;

  constructor(response: any) {
    super(response);
    this.id = this.getResponseProperty("Id");
    this.organizationId = this.getResponseProperty("OrganizationId");
    this.key = this.getResponseProperty("Key");
    this.value = this.getResponseProperty("Value");
    this.note = this.getResponseProperty("Note");
    this.creationDate = this.getResponseProperty("CreationDate");
    this.revisionDate = this.getResponseProperty("RevisionDate");
  }
}
