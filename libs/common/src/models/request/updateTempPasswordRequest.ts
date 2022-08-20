// @ts-strict-ignore
import { OrganizationUserResetPasswordRequest } from "./organizationUserResetPasswordRequest";

export class UpdateTempPasswordRequest extends OrganizationUserResetPasswordRequest {
  masterPasswordHint: string;
}
