import { BaseResponse } from "../../../../../models/response/base.response";

export class Fido2CredentialApiV2 extends BaseResponse {
  credentialIdType: "uuid" | "base64";
  credentialId: string;
  keyType: "public-key";
  keyAlgorithm: "ECDSA";
  keyCurve: "P-256";
  keyValue: string;
  rpId: string;
  userHandle: string;
  userName: string;
  counter: string;
  rpName: string;
  userDisplayName: string;
  discoverable: string;
  creationDate: string;

  constructor(data: any = null) {
    super(data);
    if (data == null) {
      return;
    }

    this.credentialIdType = this.getResponseProperty("CredentialIdType");
    this.credentialId = this.getResponseProperty("CredentialId");
    this.keyType = this.getResponseProperty("KeyType");
    this.keyAlgorithm = this.getResponseProperty("KeyAlgorithm");
    this.keyCurve = this.getResponseProperty("KeyCurve");
    this.keyValue = this.getResponseProperty("keyValue");
    this.rpId = this.getResponseProperty("RpId");
    this.userHandle = this.getResponseProperty("UserHandle");
    this.userName = this.getResponseProperty("UserName");
    this.counter = this.getResponseProperty("Counter");
    this.rpName = this.getResponseProperty("RpName");
    this.userDisplayName = this.getResponseProperty("UserDisplayName");
    this.discoverable = this.getResponseProperty("Discoverable");
    this.creationDate = this.getResponseProperty("CreationDate");
  }
}
