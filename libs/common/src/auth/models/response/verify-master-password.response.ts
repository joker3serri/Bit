import { BaseResponse } from "../../../models/response/base.response";

import { MasterPasswordPolicyResponse } from "./master-password-policy.response";

export class VerifyMasterPasswordResponse extends BaseResponse {
  masterPasswordPolicy: MasterPasswordPolicyResponse;

  constructor(response: any) {
    super(response);
    this.masterPasswordPolicy = this.getResponseProperty("MasterPasswordPolicy");
  }
}
