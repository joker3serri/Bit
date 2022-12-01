import { ApiService } from "../../abstractions/api.service";
import { OrganizationUserService } from "../../abstractions/organizationUser/organization-user.service";
import { OrganizationUserDetailsResponse } from "../../abstractions/organizationUser/responses";

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
}
