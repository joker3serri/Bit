export class BulkApproveAuthRequestsRequest {
  private requests: AdminAuthRequestUpdateWithIdRequest[];
  constructor(requests: AdminAuthRequestUpdateWithIdRequest[]) {
    this.requests = requests;
  }
}

export class AdminAuthRequestUpdateWithIdRequest {
  constructor(
    public id: string,
    public approved: boolean,
    public key?: string,
  ) {}
}
