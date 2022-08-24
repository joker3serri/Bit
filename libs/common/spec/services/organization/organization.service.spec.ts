import Substitute, { Arg, SubstituteOf } from "@fluffy-spoon/substitute";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { OrganizationData } from "@bitwarden/common/models/data/organizationData";
import { OrganizationService } from "@bitwarden/common/services/organization/organization.service";
import { StateService } from "@bitwarden/common/services/state.service";

describe("Organization Service", () => {
  const customSetup = (setupStateService: (stateService: SubstituteOf<StateService>) => void) => {
    const activeAccount = new BehaviorSubject("123");
    const activeAccountUnlocked = new BehaviorSubject(true);

    const stateService = Substitute.for<StateService>();
    setupStateService(stateService);

    stateService.activeAccount$.returns(activeAccount);
    stateService.activeAccountUnlocked$.returns(activeAccountUnlocked);

    const organizationService = new OrganizationService(stateService);

    return { organizationService, stateService, activeAccount, activeAccountUnlocked };
  };

  const setup = () => {
    return customSetup((stateService) => {
      stateService.getOrganizations(Arg.any()).resolves({
        "1": organizationData("1", "Test Org"),
      });
    });
  };

  const wait = (waitMs: number): Promise<void> => {
    return new Promise((r) => setTimeout(r, waitMs));
  };

  it("getAll", async () => {
    const { organizationService } = setup();

    const orgs = await organizationService.getAll();
    expect(orgs).toHaveLength(1);
    const org = orgs[0];
    expect(org).toEqual({
      id: "1",
      name: "Test Org",
      identifier: "test",
    });
  });

  describe("canManageSponsorships", () => {
    it("can because one is available", async () => {
      const { organizationService } = customSetup((stateService) => {
        stateService.getOrganizations(Arg.any()).resolves({
          "1": { ...organizationData("1", "Org"), familySponsorshipAvailable: true },
        });
      });

      await wait(100);

      const result = await organizationService.canManageSponsorships();
      expect(result).toBe(true);
    });

    it("can because one is used", async () => {
      const { organizationService } = customSetup((stateService) => {
        stateService.getOrganizations(Arg.any()).resolves({
          "1": { ...organizationData("1", "Test Org"), familySponsorshipFriendlyName: "Something" },
        });
      });

      await wait(100);

      const result = await organizationService.canManageSponsorships();
      expect(result).toBe(true);
    });

    it("can not because one isn't available or taken", async () => {
      const { organizationService } = customSetup((stateService) => {
        stateService.getOrganizations(Arg.any()).resolves({
          "1": { ...organizationData("1", "Org"), familySponsorshipFriendlyName: null },
        });
      });

      await wait(100);

      const result = await organizationService.canManageSponsorships();
      expect(result).toBe(false);
    });
  });

  describe("get", () => {
    it("exists", async () => {
      const { organizationService } = setup();

      await wait(100);

      const result = await organizationService.get("1");

      expect(result).toEqual({
        id: "1",
        name: "Test Org",
        identifier: "test",
      });
    });

    it("does not exist", async () => {
      const { organizationService } = setup();
      const result = await organizationService.get("2");

      expect(result).toBe(undefined);
    });
  });

  it("upsert", async () => {
    const { organizationService } = setup();
    await organizationService.upsert(organizationData("2", "Test 2"));

    expect(await firstValueFrom(organizationService.organizations$)).toEqual([
      {
        id: "1",
        name: "Test Org",
        identifier: "test",
      },
      {
        id: "2",
        name: "Test 2",
        identifier: "test",
      },
    ]);
  });

  it("save", async () => {
    const { organizationService, stateService } = setup();
    await organizationService.save({
      "1": organizationData("1", "Saved Test Org"),
    });

    stateService
      .received(1)
      .setOrganizations(
        Arg.is<{ [id: string]: OrganizationData }>((orgs) => orgs["1"].name === "Saved Test Org")
      );
  });

  describe("getByIdentifier", () => {
    it("exists", async () => {
      const { organizationService } = setup();
      await wait(100);

      const result = await organizationService.getByIdentifier("test");

      expect(result).toEqual({
        id: "1",
        name: "Test Org",
        identifier: "test",
      });
    });

    it("does not exist", async () => {
      const { organizationService } = setup();

      const result = await organizationService.getByIdentifier("blah");

      expect(result).toBeUndefined();
    });
  });

  describe("delete", () => {
    it("exists", async () => {
      const { organizationService, stateService } = setup();

      await organizationService.delete("1");

      stateService.received(2).getOrganizations(Arg.any());

      stateService.received(1).setOrganizations(Arg.any());
    });

    it("does not exist", async () => {
      const { organizationService, stateService } = setup();

      organizationService.delete("1");

      stateService.received(2).getOrganizations(Arg.any());
    });
  });

  function organizationData(id: string, name: string) {
    const data = new OrganizationData({} as any);
    data.id = id;
    data.name = name;
    data.identifier = "test";

    return data;
  }
});
