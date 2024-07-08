import { Injectable } from "@angular/core";

import { OrganizationId } from "@bitwarden/common/types/guid";
import {
  aggregateProperty,
  getUniqueItems,
  sumValue,
} from "@bitwarden/web-vault/app/tools/reports/report-utils";

import {
  MemberAccessCollectionModel,
  MemberAccessGroupModel,
  MemberAccessReportModel,
} from "../model/member-access-report.model";
import { MemberAccessExportItem } from "../view/member-access-export.view";
import { MemberAccessReportView } from "../view/member-access-report.view";

import { memberAccessReportsMock } from "./member-access-report.mock";

@Injectable({ providedIn: "root" })
export class MemberAccessReportService {
  getMemberAccessData(): MemberAccessReportModel[] {
    return memberAccessReportsMock;
  }

  /**
   * Transforms user data into a MemberAccessReportView.
   *
   * @param {UserData} userData - The user data to aggregate.
   * @param {ReportCollection[]} collections - An array of collections, each with an ID and a total number of items.
   * @returns {MemberAccessReportView} The aggregated report view.
   */
  generateMemberAccessReportView(): MemberAccessReportView[] {
    const memberAccessReportViewCollection: MemberAccessReportView[] = [];
    const memberAccessData = this.getMemberAccessData();
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
        collectionsCount: collectionsCount,
        groupsCount: groupsCount,
        itemsCount: itemsCount,
      });
    });

    return memberAccessReportViewCollection;
  }

  async generateUserReportExportItems(
    organizationId: OrganizationId,
  ): Promise<MemberAccessExportItem[]> {
    const memberAccessReports = this.getMemberAccessData();
    const userReportItemPromises = memberAccessReports.flatMap(async (memberAccessReport) => {
      const partialMemberReportItem: Partial<MemberAccessExportItem> = {
        email: memberAccessReport.email,
        name: memberAccessReport.userName,
        twoStepLogin: memberAccessReport.twoFactorEnabled ? "On" : "Off",
        accountRecovery: memberAccessReport.accountRecoveryEnabled ? "On" : "Off",
      };
      const groupCollectionPromises = memberAccessReport.groups.map(async (group) => {
        const groupPartialReportItem = { ...partialMemberReportItem, group: group.name };
        return await this.buildReportItemFromCollection(
          group.collections,
          groupPartialReportItem,
          organizationId,
        );
      });
      const noGroupPartialReportItem = { ...partialMemberReportItem, group: "(No group)" };
      const noGroupCollectionPromises = await this.buildReportItemFromCollection(
        memberAccessReport.collections,
        noGroupPartialReportItem,
        organizationId,
      );

      return Promise.all([...groupCollectionPromises, noGroupCollectionPromises]);
    });

    const nestedUserReportItems = (await Promise.all(userReportItemPromises)).flat();
    return nestedUserReportItems.flat();
  }

  async buildReportItemFromCollection(
    memberAccessCollections: MemberAccessCollectionModel[],
    partialReportItem: Partial<MemberAccessExportItem>,
    organizationId: string,
  ): Promise<MemberAccessExportItem[]> {
    const reportItemPromises = memberAccessCollections.map(async (collection) => {
      return {
        ...partialReportItem,
        collection: await collection.name.decrypt(organizationId),
        collectionPermission: "read only",
        totalItems: collection.itemCount.toString(),
      };
    });

    return Promise.all(reportItemPromises);
  }
}
