import { memberAccessReports } from "../member-access-report.mock";

import {
  generateMemberAccessReportView,
  generateUserReportExportItems,
} from "./member-access-report.view";

const mockOrganizationId = "mockOrgId";

describe("generateMemberAccessReportView", () => {
  it("should generate member access report view", () => {
    const result = generateMemberAccessReportView(memberAccessReports);

    expect(result).toEqual([
      {
        name: "Sarah Johnson",
        email: "sjohnson@email.com",
        collections: 4,
        groups: 3,
        items: 70,
      },
      {
        name: "James Lull",
        email: "jlull@email.com",
        collections: 2,
        groups: 2,
        items: 20,
      },
      {
        name: "Beth Williams",
        email: "bwilliams@email.com",
        collections: 2,
        groups: 1,
        items: 60,
      },
      {
        name: "Ray Williams",
        email: "rwilliams@email.com",
        collections: 3,
        groups: 3,
        items: 36,
      },
    ]);
  });
});

describe("generateUserReportExportItems", () => {
  it("should generate user report export items", async () => {
    const result = await generateUserReportExportItems(memberAccessReports, mockOrganizationId);

    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          email: "sjohnson@email.com",
          name: "Sarah Johnson",
          twoStepLogin: "On",
          accountRecovery: "On",
          group: "Group 1",
          collection: expect.any(String),
          collectionPermission: "read only",
          totalItems: "10",
        }),
        expect.objectContaining({
          email: "jlull@email.com",
          name: "James Lull",
          twoStepLogin: "Off",
          accountRecovery: "Off",
          group: "(No group)",
          collection: expect.any(String),
          collectionPermission: "read only",
          totalItems: "15",
        }),
      ]),
    );
  });
});
