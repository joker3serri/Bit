import {
  ActivatedRouteSnapshot,
  convertToParamMap,
  Router,
  RouterStateSnapshot,
} from "@angular/router";
import { mock, mockReset } from "jest-mock-extended";

import { I18nService } from "../../../../../../libs/common/src/abstractions/i18n.service";
import { OrganizationService } from "../../../../../../libs/common/src/abstractions/organization.service";
import { PlatformUtilsService } from "../../../../../../libs/common/src/abstractions/platformUtils.service";
import { SyncService } from "../../../../../../libs/common/src/abstractions/sync.service";
import { OrganizationUserType } from "../../../../../../libs/common/src/enums/organizationUserType";
import { Organization } from "../../../../../../libs/common/src/models/domain/organization";

import { OrganizationPermissionsGuard } from "./org-permissions.guard";

describe("Organization Permissions Guard", () => {
  const organizationService = mock<OrganizationService>();
  const router = mock<Router>();
  const emptyState = mock<RouterStateSnapshot>();
  const route = mock<ActivatedRouteSnapshot>();

  let organizationPermissionsGuard: OrganizationPermissionsGuard;

  const orgFactory = (props: Partial<Organization> = {}) =>
    Object.assign(
      new Organization(),
      {
        id: "myOrgId",
        enabled: true,
        type: OrganizationUserType.Admin,
      },
      props
    );

  beforeEach(() => {
    mockReset(organizationService);
    mockReset(router);
    mockReset(emptyState);
    mockReset(route);

    route.params = {
      organizationId: orgFactory().id,
    };

    organizationPermissionsGuard = new OrganizationPermissionsGuard(
      router,
      organizationService,
      mock<PlatformUtilsService>(),
      mock<I18nService>(),
      mock<SyncService>()
    );
  });

  it("blocks navigation if organization does not exist", async () => {
    organizationService.get.mockResolvedValue(null);

    const actual = await organizationPermissionsGuard.canActivate(route, emptyState);

    expect(actual).not.toBe(true);
  });

  describe("given a disabled organization", () => {
    it("blocks navigation if user is not an owner", async () => {
      const org = orgFactory({
        type: OrganizationUserType.Admin,
        enabled: false,
      });
      organizationService.get.calledWith(org.id).mockResolvedValue(org);

      const actual = await organizationPermissionsGuard.canActivate(route, emptyState);

      expect(actual).not.toBe(true);
    });

    it("permits navigation if user is an owner", async () => {
      const org = orgFactory({
        type: OrganizationUserType.Owner,
        enabled: false,
      });
      organizationService.get.calledWith(org.id).mockResolvedValue(org);

      const actual = await organizationPermissionsGuard.canActivate(route, emptyState);

      expect(actual).toBe(true);
    });
  });

  it("permits navigation if no permissions are specified", async () => {
    route.data = {};
    const org = orgFactory();
    organizationService.get.calledWith(org.id).mockResolvedValue(org);

    const actual = await organizationPermissionsGuard.canActivate(route, emptyState);

    expect(actual).toBe(true);
  });

  it("permits navigation if the user has permissions", async () => {
    const permissionsCallback = jest.fn();
    permissionsCallback.mockImplementation((org) => true);
    route.data = {
      organizationPermissions: permissionsCallback,
    };

    const org = orgFactory();
    organizationService.get.calledWith(org.id).mockResolvedValue(org);

    const actual = await organizationPermissionsGuard.canActivate(route, emptyState);

    expect(permissionsCallback).toHaveBeenCalled();
    expect(actual).toBe(true);
  });

  describe("if the user does not have permissions", () => {
    it("and there is no Item ID, block navigation", async () => {
      const permissionsCallback = jest.fn();
      permissionsCallback.mockImplementation((org) => false);
      route.data = {
        organizationPermissions: permissionsCallback,
      };

      const state = mock<RouterStateSnapshot>({
        root: mock<ActivatedRouteSnapshot>({
          queryParamMap: convertToParamMap({}),
        }),
      });

      const org = orgFactory();
      organizationService.get.calledWith(org.id).mockResolvedValue(org);

      organizationService.get.calledWith(org.id).mockResolvedValue(org);
      const actual = await organizationPermissionsGuard.canActivate(route, state);

      expect(permissionsCallback).toHaveBeenCalled();
      expect(actual).not.toBe(true);
    });

    it("and there is an Item ID, redirect to the item in the individual vault", async () => {
      route.data = {
        organizationPermissions: (org: Organization) => false,
      };
      const thisState = mock<RouterStateSnapshot>({
        root: mock<ActivatedRouteSnapshot>({
          queryParamMap: convertToParamMap({
            itemId: "myItemId",
          }),
        }),
      });
      const org = orgFactory();
      organizationService.get.calledWith(org.id).mockResolvedValue(org);

      const actual = await organizationPermissionsGuard.canActivate(route, thisState);

      expect(router.createUrlTree).toHaveBeenCalledWith(["/vault"], {
        queryParams: { itemId: "myItemId" },
      });
      expect(actual).not.toBe(true);
    });
  });
});
