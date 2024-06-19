import {
  OrganizationUserStatusType,
  ProviderUserStatusType,
} from "@bitwarden/common/admin-console/enums";
import { TableDataSource } from "@bitwarden/components";

import { StatusType, UserViewTypes } from "./new-base.people.component";

/**
 * Returns true if the user matches the status, or if the status is `null`, if the user is active (not revoked).
 */
function statusFilter(user: UserViewTypes, status: StatusType) {
  if (status == null) {
    return user.status != OrganizationUserStatusType.Revoked;
  }

  return user.status === status;
}

/**
 * Returns true if the string matches the user's id, name, or email.
 * (The default string search includes all properties, which can return false positives for collection names etc)
 */
function textFilter(user: UserViewTypes, text: string) {
  const normalizedText = text?.toLowerCase();
  return (
    !normalizedText || // null/empty strings should be ignored, i.e. always return true
    user.email.toLowerCase().includes(normalizedText) ||
    user.id.toLowerCase().includes(normalizedText) ||
    user.name?.toLowerCase().includes(normalizedText)
  );
}

export function peopleFilter(searchText: string, status: StatusType) {
  return (user: UserViewTypes) => statusFilter(user, status) && textFilter(user, searchText);
}

/**
 * An extended TableDataSource class which also tracks user totals.
 * This keeps all information about the data encapsulated in the TableDataSource, and avoids recalculating it
 * unless the underlying data changes.
 */
export abstract class PeopleTableDataSource<T extends UserViewTypes> extends TableDataSource<T> {
  protected abstract statusType: typeof OrganizationUserStatusType | typeof ProviderUserStatusType;

  /**
   * The number of 'active' users, that is, all users who are not in a revoked status.
   */
  activeUserCount: number;

  invitedUserCount: number;
  acceptedUserCount: number;
  confirmedUserCount: number;
  revokedUserCount: number;

  override set data(data: T[]) {
    super.data = data;

    if (data == null) {
      return;
    }

    this.activeUserCount = this.data.filter((u) => u.status !== this.statusType.Revoked).length;

    this.invitedUserCount = this.data.filter((u) => u.status === this.statusType.Invited).length;
    this.acceptedUserCount = this.data.filter((u) => u.status === this.statusType.Accepted).length;
    this.confirmedUserCount = this.data.filter(
      (u) => u.status === this.statusType.Confirmed,
    ).length;
    this.revokedUserCount = this.data.filter((u) => u.status === this.statusType.Revoked).length;
  }

  override get data() {
    // If you override a setter, you must also override the getter
    return super.data;
  }

  /**
   * Remove a user from the data source. Use this to ensure the table is re-rendered after the change.
   */
  removeUser(user: T) {
    const index = this.data.indexOf(user);
    if (index > -1) {
      // Clone the array so that the setter for dataSource.data is triggered to update the table rendering
      const updatedData = [...this.data];
      updatedData.splice(index, 1);
      this.data = updatedData;
    }
  }

  /**
   * Replace a user in the data source (by matching on user.id). Use this to ensure the table is re-rendered after the change.
   */
  replaceUser(user: T) {
    const index = this.data.findIndex((u) => u.id === user.id);
    if (index > -1) {
      // Clone the array so that the setter for dataSource.data is triggered to update the table rendering
      const updatedData = [...this.data];
      updatedData[index] = user;
      this.data = updatedData;
    }
  }
}
