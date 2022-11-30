import { ApiService } from "../../abstractions/api.service";
import { OrganizationUserService } from "../../abstractions/organizationUser/organization-user.service";

export class OrganizationUserServiceImplementation implements OrganizationUserService {
  constructor(private apiService: ApiService) {}
}
