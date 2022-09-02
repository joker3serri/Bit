import { BaseResponse } from "@bitwarden/common/models/response/baseResponse";
import { SecretListView } from "@bitwarden/common/models/view/secretListView";

export class SecretIdentifierResponse extends BaseResponse {
  id: string;
  organizationId: string;
  name: string;
  creationDate: string;
  revisionDate: string;

  constructor(response: any) {
    super(response);
    this.id = this.getResponseProperty("Id");
    this.organizationId = this.getResponseProperty("OrganizationId");
    this.name = this.getResponseProperty("Key");
    this.creationDate = this.getResponseProperty("CreationDate");
    this.revisionDate = this.getResponseProperty("RevisionDate");
  }

  toSecretListView(): SecretListView {
    const secretListView = new SecretListView();
    secretListView.id = this.id;
    secretListView.organizationId = this.organizationId;
    secretListView.name = this.name;
    secretListView.creationDate = this.creationDate;
    secretListView.revisionDate = this.revisionDate;
    return secretListView;
  }
}
