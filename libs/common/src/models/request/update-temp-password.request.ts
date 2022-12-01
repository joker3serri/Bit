import { OrganizationUserResetPasswordRequest } from "../../abstractions/organizationUser/requests";

export class UpdateTempPasswordRequest extends OrganizationUserResetPasswordRequest {
  masterPasswordHint: string;
}
