import { ListResponse } from "../../models/response/list.response";

import {
  OrganizationUserAcceptRequest,
  OrganizationUserConfirmRequest,
  OrganizationUserInviteRequest,
} from "./requests";
import {
  OrganizationUserBulkResponse,
  OrganizationUserDetailsResponse,
  OrganizationUserResetPasswordDetailsReponse,
  OrganizationUserUserDetailsResponse,
} from "./responses";

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

  /**
   * Retrieve a list of all users that belong to the specified organization
   * @param organizationId - Identifier for the organization
   */
  getAllUsers: (
    organizationId: string
  ) => Promise<ListResponse<OrganizationUserUserDetailsResponse>>;

  /**
   * Retrieve reset password details for the specified organization user
   * @param organizationId - Identifier for the user's organization
   * @param id - Organization user identifier
   */
  getOrganizationUserResetPasswordDetails: (
    organizationId: string,
    id: string
  ) => Promise<OrganizationUserResetPasswordDetailsReponse>;

  /**
   * Create new organization user invite(s) for the specified organization
   * @param organizationId - Identifier for the organization
   * @param request - New user invitation request details
   */
  postOrganizationUserInvite: (
    organizationId: string,
    request: OrganizationUserInviteRequest
  ) => Promise<void>;

  /**
   * Re-invite the specified organization user
   * @param organizationId - Identifier for the user's organization
   * @param id - Organization user identifier
   */
  postOrganizationUserReinvite: (organizationId: string, id: string) => Promise<any>;

  /**
   * Re-invite many organization users for the specified organization
   * @param organizationId - Identifier for the organization
   * @param ids - A list of organization user identifiers
   * @return List of user ids, including both those that were successfully re-invited and those that had an error
   */
  postManyOrganizationUserReinvite: (
    organizationId: string,
    ids: string[]
  ) => Promise<ListResponse<OrganizationUserBulkResponse>>;

  /**
   * Accept an organization user invitation
   * @param organizationId - Identifier for the organization to accept
   * @param id - Organization user identifier
   * @param request - Request details for accepting the invitation
   */
  postOrganizationUserAccept: (
    organizationId: string,
    id: string,
    request: OrganizationUserAcceptRequest
  ) => Promise<void>;
}
