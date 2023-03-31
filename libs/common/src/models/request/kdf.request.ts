import { PasswordRequest } from "../../auth/models/request/password.request";
import { KdfType } from "../../enums/kdf-type";

export class KdfRequest extends PasswordRequest {
  kdf: KdfType;
  kdfIterations: number;
  kdfMemory?: number;
  kdfParallelism?: number;
}
