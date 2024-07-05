import { EncString } from "@bitwarden/common/platform/models/domain/enc-string";
import { OrganizationId } from "@bitwarden/common/types/guid";
import {
  aggregateProperty,
  getUniqueItems,
  sumValue,
} from "@bitwarden/web-vault/app/tools/reports/report-utils";

export type MemberAccessReportView = {
  name: string;
  email: string;
  collections: number;
  groups: number;
  items: number;
};

export type UserReportItem = {
  email?: string;
  name?: string;
  twoStepLogin?: string;
  accountRecovery?: string;
  group?: string;
  collection: string;
  collectionPermission: string;
  totalItems: string;
};

export const userReportItemHeaders: { [key in keyof UserReportItem]: string } = {
  email: "Email Address",
  name: "Full Name",
  twoStepLogin: "Two-Step Login",
  accountRecovery: "Account Recovery",
  group: "Group Name",
  collection: "Collection Name",
  collectionPermission: "Collection Permission",
  totalItems: "Total Items",
};

export type MemberAccessCollectionModel = {
  id: string;
  name: EncString;
  itemCount: number;
};

export type MemberAccessGroupModel = {
  id: string;
  name: string;
  itemCount: number;
  collections: MemberAccessCollectionModel[];
};

export type MemberAccessReportModel = {
  userName: string;
  email: string;
  twoFactorEnabled: boolean;
  accountRecoveryEnabled: boolean;
  collections: MemberAccessCollectionModel[];
  groups: MemberAccessGroupModel[];
};

/**
 * Transforms user data into a MemberAccessReportView.
 *
 * @param {UserData} userData - The user data to aggregate.
 * @param {ReportCollection[]} collections - An array of collections, each with an ID and a total number of items.
 * @returns {MemberAccessReportView} The aggregated report view.
 */
export function generateMemberAccessReportView(
  memberAccessData: MemberAccessReportModel[],
): MemberAccessReportView[] {
  const memberAccessReportViewCollection: MemberAccessReportView[] = [];
  memberAccessData.forEach((userData) => {
    const name = userData.userName;
    const email = userData.email;
    const groupCollections = aggregateProperty<
      MemberAccessGroupModel,
      "collections",
      MemberAccessCollectionModel
    >(userData.groups, "collections");

    const uniqueCollections = getUniqueItems(
      [...groupCollections, ...userData.collections],
      (item: MemberAccessCollectionModel) => item.id,
    );
    const collectionsCount = uniqueCollections.length;
    const groupsCount = userData.groups.length;
    const itemsCount = sumValue(
      uniqueCollections,
      (collection: MemberAccessCollectionModel) => collection.itemCount,
    );

    memberAccessReportViewCollection.push({
      name: name,
      email: email,
      collections: collectionsCount,
      groups: groupsCount,
      items: itemsCount,
    });
  });

  return memberAccessReportViewCollection;
}

export async function generateUserReportExportItems(
  memberAccessReports: MemberAccessReportModel[],
  organizationId: OrganizationId,
): Promise<UserReportItem[]> {
  const userReportItemPromises = memberAccessReports.flatMap(async (memberAccessReport) => {
    const partialMemberReportItem: Partial<UserReportItem> = {
      email: memberAccessReport.email,
      name: memberAccessReport.userName,
      twoStepLogin: memberAccessReport.twoFactorEnabled ? "On" : "Off",
      accountRecovery: memberAccessReport.accountRecoveryEnabled ? "On" : "Off",
    };
    const groupCollectionPromises = memberAccessReport.groups.map(async (group) => {
      const groupPartialReportItem = { ...partialMemberReportItem, group: group.name };
      return await buildReportItemFromCollection(
        group.collections,
        groupPartialReportItem,
        organizationId,
      );
    });
    const noGroupPartialReportItem = { ...partialMemberReportItem, group: "(No group)" };
    const noGroupCollectionPromises = await buildReportItemFromCollection(
      memberAccessReport.collections,
      noGroupPartialReportItem,
      organizationId,
    );

    return Promise.all([...groupCollectionPromises, noGroupCollectionPromises]);
  });

  const nestedUserReportItems = (await Promise.all(userReportItemPromises)).flat();
  return nestedUserReportItems.flat();
}

async function buildReportItemFromCollection(
  memberAccessCollections: MemberAccessCollectionModel[],
  partialReportItem: Partial<UserReportItem>,
  organizationId: string,
): Promise<UserReportItem[]> {
  const reportItemPromises = memberAccessCollections.map(async (collection) => {
    return {
      ...partialReportItem,
      collection: await collection.name.decrypt(organizationId),
      collectionPermission: "read only", // Assuming this is part of MemberAccessCollectionModel
      totalItems: collection.itemCount.toString(),
    };
  });

  return Promise.all(reportItemPromises);
}
