import { BaseResponse } from "../../../models/response/base.response";

import { MasterPasswordPolicyResponse } from "./master-password-policy.response";

export class IdentityDeviceVerificationResponse extends BaseResponse {
  deviceVerified: boolean = false;
  email?: string;
  masterPasswordPolicy?: MasterPasswordPolicyResponse;

  constructor(response: any) {
    super(response);
    this.masterPasswordPolicy = new MasterPasswordPolicyResponse(
      this.getResponseProperty("MasterPasswordPolicy"),
    );
    this.email = this.getResponseProperty("Email");
    this.deviceVerified = this.getResponseProperty("DeviceVerified");
  }
}
