import { ComponentFixture, TestBed } from "@angular/core/testing";
import { Router } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { BehaviorSubject } from "rxjs";

import { BillingAccountProfileStateService } from "@bitwarden/common/billing/abstractions";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import BrowserPopupUtils from "../../../../../../platform/popup/browser-popup-utils";

import { OpenAttachmentsComponent } from "./open-attachments.component";

describe("OpenAttachmentsComponent", () => {
  let component: OpenAttachmentsComponent;
  let fixture: ComponentFixture<OpenAttachmentsComponent>;
  let router: Router;
  const hasPremiumFromAnySource$ = new BehaviorSubject<boolean>(true);
  const openCurrentPagePopout = jest
    .spyOn(BrowserPopupUtils, "openCurrentPagePopout")
    .mockResolvedValue(null);

  beforeEach(async () => {
    openCurrentPagePopout.mockClear();

    await TestBed.configureTestingModule({
      imports: [OpenAttachmentsComponent, RouterTestingModule],
      providers: [
        { provide: I18nService, useValue: { t: (key: string) => key } },
        { provide: BillingAccountProfileStateService, useValue: { hasPremiumFromAnySource$ } },
      ],
    }).compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(OpenAttachmentsComponent);
    component = fixture.componentInstance;
    component.cipherId = "5555-444-3333";
    router = TestBed.inject(Router);
    jest.spyOn(router, "navigate").mockResolvedValue(true);
    fixture.detectChanges();
  });

  it("opens attachments in new popout", async () => {
    component.openAttachmentsInPopout = true;

    await component.openAttachments();

    expect(router.navigate).not.toHaveBeenCalled();
    expect(openCurrentPagePopout).toHaveBeenCalledWith(
      window,
      "http:/localhost//attachments?cipherId=5555-444-3333",
    );
  });

  it("opens attachments in same window", async () => {
    component.openAttachmentsInPopout = false;

    await component.openAttachments();

    expect(openCurrentPagePopout).not.toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(["/attachments"], {
      queryParams: { cipherId: "5555-444-3333" },
    });
  });

  it("routes the user to the premium page when they cannot access premium features", async () => {
    hasPremiumFromAnySource$.next(false);

    await component.openAttachments();

    expect(router.navigate).toHaveBeenCalledWith(["/premium"]);
  });
});
