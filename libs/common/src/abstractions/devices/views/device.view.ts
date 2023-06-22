// import { View } from "@bitwarden/common/models/view/view";
import { DeviceType } from "../../../enums";
import { View } from "../../../models/view/view";
import { DeviceResponse } from "../responses/device.response";

export class DeviceView implements View {
  id: string;
  userId: string;
  name: string;
  identifier: string;
  type: DeviceType;
  creationDate: string;
  revisionDate: string;

  // TODO: how to handle encrypted data in a view?
  // The Domain models lies at the center of our data model, and represents encrypted data.
  // View models represent the decrypted state of the corresponding Domain model.
  // They typically match the Domain model but contains a decrypted string for any EncString fields.
  encryptedUserKey: string;
  encryptedPublicKey: string;
  encryptedPrivateKey: string;

  constructor(deviceResponse: DeviceResponse) {
    Object.assign(this, deviceResponse);
  }
}
