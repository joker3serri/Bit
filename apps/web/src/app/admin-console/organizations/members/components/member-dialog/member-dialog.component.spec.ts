import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import {
  ComponentFixture,
  ComponentFixtureAutoDetect,
  TestBed,
  fakeAsync,
} from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { mock } from "jest-mock-extended";

import { OrganizationService } from "@bitwarden/common/admin-console/abstractions/organization/organization.service.abstraction";
import { OrganizationUserService } from "@bitwarden/common/admin-console/abstractions/organization-user/organization-user.service";
import { Organization } from "@bitwarden/common/admin-console/models/domain/organization";
import { ConfigServiceAbstraction } from "@bitwarden/common/platform/abstractions/config/config.service.abstraction";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { DialogService } from "@bitwarden/components";

import { CollectionAdminService } from "../../../../../vault/core/collection-admin.service";
import { GroupService, UserAdminService } from "../../../core";
import { MembersModule } from "../../members.module";

import { MemberDialogComponent, MemberDialogTab } from "./member-dialog.component";

describe("MemberDialogComponent", () => {
  let component: MemberDialogComponent;
  let fixture: ComponentFixture<MemberDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [NoopAnimationsModule, MembersModule],
      providers: [
        {
          provide: UserAdminService,
          useValue: mock<UserAdminService>(),
        },
        {
          provide: GroupService,
          useValue: mock<GroupService>(),
        },
        {
          provide: CollectionAdminService,
          useValue: mock<CollectionAdminService>(),
        },
        {
          provide: OrganizationService,
          useValue: mock<OrganizationService>(),
        },
        {
          provide: OrganizationUserService,
          useValue: mock<OrganizationUserService>(),
        },
        {
          provide: I18nService,
          useValue: mock<I18nService>(),
        },
        {
          provide: DialogService,
          useValue: mock<DialogService>(),
        },
        {
          provide: ConfigServiceAbstraction,
          useValue: mock<ConfigServiceAbstraction>(),
        },
        {
          provide: DIALOG_DATA,
          useValue: {
            initialTab: MemberDialogTab.Role,
            organizationId: 1,
            allOrganizationUserEmails: [],
          },
        },
        {
          provide: DialogRef,
          useValue: mock<DialogRef>(),
        },
        {
          provide: PlatformUtilsService,
          useValue: mock<PlatformUtilsService>(),
        },
        { provide: ComponentFixtureAutoDetect, useValue: true },
      ],
      schemas: [],
    }).compileComponents();
  });

  beforeEach(() => {
    const organizationService = TestBed.inject(OrganizationService);
    const collectionAdminService = TestBed.inject(CollectionAdminService);

    jest.spyOn(organizationService, "get").mockReturnValue({} as unknown as Organization);
    jest.spyOn(collectionAdminService, "getAll").mockResolvedValue([]);

    fixture = TestBed.createComponent(MemberDialogComponent);
    component = fixture.componentInstance;

    fixture.detectChanges();
  });

  it("should initialize component", () => {
    expect(component).toBeTruthy();
  });

  it("should invite user when pressing enter on email input", fakeAsync(() => {
    const userServiceMock = TestBed.inject(UserAdminService);

    const emailInput: HTMLInputElement = fixture.nativeElement.querySelector("#emails");

    // Update value and make Angular aware
    emailInput.value = "test@mydomain.com";
    emailInput.dispatchEvent(new Event("input"));

    // Trigger keyup.enter, which should submit form.
    emailInput.dispatchEvent(new KeyboardEvent("keydown", { key: "enter" }));

    expect(userServiceMock.invite).toHaveBeenCalledWith(["test@mydomain.com"], expect.anything());
  }));
});
