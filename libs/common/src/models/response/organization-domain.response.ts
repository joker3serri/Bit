import { BaseResponse } from "./base.response";

export class OrganizationDomainResponse extends BaseResponse {
  id: string;
  organizationId: string;
  txt: string;
  domainName: string;
  creationDate: string;
  nextRunDate: string;
  jobRunCount: number;
  verifiedDate?: string;

  constructor(response: any) {
    super(response);
    this.id = this.getResponseProperty("Id");
    this.organizationId = this.getResponseProperty("OrganizationId");
    this.txt = this.getResponseProperty("Txt");
    this.domainName = this.getResponseProperty("DomainName");
    this.creationDate = this.getResponseProperty("CreationDate");
    this.nextRunDate = this.getResponseProperty("NextRunDate");
    this.jobRunCount = this.getResponseProperty("JobRunCount");
    this.verifiedDate = this.getResponseProperty("VerifiedDate");

    // Might be worth converting string dates to actual dates for ease of use
    // this.creationDate = obj.creationDate != null ? new Date(obj.creationDate) : null;
    // this.nextRunDate = obj.nextRunDate != null ? new Date(obj.nextRunDate) : null;
    // this.verifiedDate = obj.verifiedDate != null ? new Date(obj.verifiedDate) : null;
  }
}
