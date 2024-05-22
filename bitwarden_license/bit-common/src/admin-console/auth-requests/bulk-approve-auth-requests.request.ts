export class AdminAuthRequestUpdateWithIdRequest {
  constructor(
    public id: string,
    public approved: boolean,
    public key?: string,
  ) {}
}
