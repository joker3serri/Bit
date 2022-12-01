import { ApiService } from "../../abstractions/api.service";
import { OrganizationUserService } from "../../abstractions/organizationUser/organization-user.service";
import { OrganizationUserInviteRequest } from "../../abstractions/organizationUser/requests";
import {
  OrganizationUserDetailsResponse,
  OrganizationUserResetPasswordDetailsReponse,
  OrganizationUserUserDetailsResponse,
} from "../../abstractions/organizationUser/responses";
import { ListResponse } from "../../models/response/list.response";

export class OrganizationUserServiceImplementation implements OrganizationUserService {
  constructor(private apiService: ApiService) {}

  async getOrganizationUser(
    organizationId: string,
    id: string
  ): Promise<OrganizationUserDetailsResponse> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/users/" + id,
      null,
      true,
      true
    );
    return new OrganizationUserDetailsResponse(r);
  }

  async getOrganizationUserGroups(organizationId: string, id: string): Promise<string[]> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/users/" + id + "/groups",
      null,
      true,
      true
    );
    return r;
  }

  async getAllUsers(
    organizationId: string
  ): Promise<ListResponse<OrganizationUserUserDetailsResponse>> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/users",
      null,
      true,
      true
    );
    return new ListResponse(r, OrganizationUserUserDetailsResponse);
  }

  async getOrganizationUserResetPasswordDetails(
    organizationId: string,
    id: string
  ): Promise<OrganizationUserResetPasswordDetailsReponse> {
    const r = await this.apiService.send(
      "GET",
      "/organizations/" + organizationId + "/users/" + id + "/reset-password-details",
      null,
      true,
      true
    );
    return new OrganizationUserResetPasswordDetailsReponse(r);
  }

  postOrganizationUserInvite(
    organizationId: string,
    request: OrganizationUserInviteRequest
  ): Promise<void> {
    return this.apiService.send(
      "POST",
      "/organizations/" + organizationId + "/users/invite",
      request,
      true,
      false
    );
  }
}
