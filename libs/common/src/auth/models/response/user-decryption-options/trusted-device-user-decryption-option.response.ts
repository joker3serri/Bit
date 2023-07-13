import { BaseResponse } from "../../../../models/response/base.response";
import { EncString } from "../../../../platform/models/domain/enc-string";

export interface ITrustedDeviceUserDecryptionOptionServerResponse {
  HasAdminApproval: boolean;
  HasApprovingDevice: boolean;
  EncryptedPrivateKey?: string;
  EncryptedUserKey?: string;
}

export class TrustedDeviceUserDecryptionOptionResponse extends BaseResponse {
  hasAdminApproval: boolean;
  hasApprovingDevices: boolean;
  encryptedPrivateKey: EncString;
  encryptedUserKey: EncString;

  constructor(response: any) {
    super(response);
    this.hasAdminApproval = this.getResponseProperty("HasAdminApproval");

    this.hasApprovingDevices = this.getResponseProperty("HasApprovingDevices");

    if (response.EncryptedPrivateKey) {
      this.encryptedPrivateKey = new EncString(this.getResponseProperty("EncryptedPrivateKey"));
    }
    if (response.EncryptedUserKey) {
      this.encryptedUserKey = new EncString(this.getResponseProperty("EncryptedUserKey"));
    }
  }
}
