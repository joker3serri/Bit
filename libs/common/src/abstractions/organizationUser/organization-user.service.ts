import { OrganizationUserDetailsResponse } from "./responses";

/**
 * Service for interacting with Organization Users via the API
 */
export abstract class OrganizationUserService {
  /**
   * Retrieve a single organization user by Id
   * @param organizationId - Identifier for the user's organization
   * @param id - Organization user identifier
   */
  getOrganizationUser: (
    organizationId: string,
    id: string
  ) => Promise<OrganizationUserDetailsResponse>;

  /**
   * Retrieve a list of groups Ids the specified organization user belongs to
   * @param organizationId - Identifier for the user's organization
   * @param id - Organization user identifier
   */
  getOrganizationUserGroups: (organizationId: string, id: string) => Promise<string[]>;
}
