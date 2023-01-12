export class AccessPolicyRequest {
  granteeId: string;
  read: boolean;
  write: boolean;

  constructor(granteeId: string) {
    this.granteeId = granteeId;
    this.read = true;
    this.write = false;
  }
}
