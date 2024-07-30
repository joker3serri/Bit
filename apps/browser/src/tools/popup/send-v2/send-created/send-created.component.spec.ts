import { CommonModule, Location } from "@angular/common";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { ActivatedRoute, RouterLink } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { MockProxy, mock } from "jest-mock-extended";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ButtonModule, ToastService } from "@bitwarden/components";

import { PopOutComponent } from "../../../../platform/popup/components/pop-out.component";
import { PopupFooterComponent } from "../../../../platform/popup/layout/popup-footer.component";
import { PopupHeaderComponent } from "../../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "../../../../platform/popup/layout/popup-page.component";

import { SendCreatedComponent } from "./send-created.component";

describe("SendCreatedComponent", () => {
  let component: SendCreatedComponent;
  let configService: MockProxy<ConfigService>;
  let fixture: ComponentFixture<SendCreatedComponent>;
  let i18nService: MockProxy<I18nService>;
  let platformUtilsService: MockProxy<PlatformUtilsService>;
  let toastService: MockProxy<ToastService>;
  let location: MockProxy<Location>;
  let activatedRoute: MockProxy<ActivatedRoute>;

  const link = "https://example.com/send";

  beforeEach(async () => {
    configService = mock<ConfigService>();
    i18nService = mock<I18nService>();
    platformUtilsService = mock<PlatformUtilsService>();
    toastService = mock<ToastService>();
    location = mock<Location>();
    activatedRoute = mock<ActivatedRoute>();

    activatedRoute.snapshot = {
      queryParamMap: {
        get: jest.fn().mockReturnValue(link),
      },
    } as any;

    await TestBed.configureTestingModule({
      imports: [
        CommonModule,
        RouterTestingModule,
        JslibModule,
        ButtonModule,
        PopOutComponent,
        PopupHeaderComponent,
        PopupPageComponent,
        RouterLink,
        PopupFooterComponent,
        SendCreatedComponent,
      ],
      providers: [
        { provide: ConfigService, useValue: configService },
        { provide: I18nService, useValue: i18nService },
        { provide: PlatformUtilsService, useValue: platformUtilsService },
        { provide: ToastService, useValue: toastService },
        { provide: Location, useValue: location },
        { provide: ActivatedRoute, useValue: activatedRoute },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(SendCreatedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("should navigate back on close", () => {
    component.close();
    expect(location.back).toHaveBeenCalled();
  });

  it("should copy link and show toast", () => {
    component.copyLink();
    expect(platformUtilsService.copyToClipboard).toHaveBeenCalledWith(link);
    expect(toastService.showToast).toHaveBeenCalledWith({
      variant: "success",
      title: null,
      message: i18nService.t("sendLinkCopied"),
    });
  });
});
