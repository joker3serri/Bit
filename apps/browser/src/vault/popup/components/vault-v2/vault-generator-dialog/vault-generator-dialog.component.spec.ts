import { DIALOG_DATA, DialogRef } from "@angular/cdk/dialog";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { NoopAnimationsModule } from "@angular/platform-browser/animations";
import { mock, MockProxy } from "jest-mock-extended";
import { BehaviorSubject } from "rxjs";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import {
  PasswordGenerationServiceAbstraction,
  PasswordGeneratorOptions,
  UsernameGenerationServiceAbstraction,
  UsernameGeneratorOptions,
} from "@bitwarden/generator-legacy";

import {
  GeneratorDialogParams,
  GeneratorDialogResult,
  VaultGeneratorDialogComponent,
} from "./vault-generator-dialog.component";

describe("VaultGeneratorDialogComponent", () => {
  let component: VaultGeneratorDialogComponent;
  let fixture: ComponentFixture<VaultGeneratorDialogComponent>;

  let mockDialogRef: MockProxy<DialogRef<GeneratorDialogResult>>;
  let mockLegacyPasswordGenerationService: MockProxy<PasswordGenerationServiceAbstraction>;
  let mockLegacyUsernameGenerationService: MockProxy<UsernameGenerationServiceAbstraction>;
  let mockPlatformUtilsService: MockProxy<PlatformUtilsService>;

  let dialogData: GeneratorDialogParams;

  let passwordOptions$: BehaviorSubject<any>;
  let usernameOptions$: BehaviorSubject<any>;

  beforeEach(async () => {
    passwordOptions$ = new BehaviorSubject([
      {
        type: "password",
      },
    ] as [PasswordGeneratorOptions]);
    usernameOptions$ = new BehaviorSubject([
      {
        type: "word",
      },
    ] as [UsernameGeneratorOptions]);

    mockDialogRef = mock<DialogRef<GeneratorDialogResult>>();
    mockPlatformUtilsService = mock<PlatformUtilsService>();

    mockLegacyPasswordGenerationService = mock<PasswordGenerationServiceAbstraction>();
    mockLegacyPasswordGenerationService.getOptions$.mockReturnValue(passwordOptions$);

    mockLegacyUsernameGenerationService = mock<UsernameGenerationServiceAbstraction>();
    mockLegacyUsernameGenerationService.getOptions$.mockReturnValue(usernameOptions$);

    dialogData = { type: "password" };

    await TestBed.configureTestingModule({
      imports: [VaultGeneratorDialogComponent, NoopAnimationsModule],
      providers: [
        { provide: I18nService, useValue: { t: (key: string) => key } },
        { provide: DIALOG_DATA, useValue: dialogData },
        { provide: DialogRef, useValue: mockDialogRef },
        {
          provide: PasswordGenerationServiceAbstraction,
          useValue: mockLegacyPasswordGenerationService,
        },
        {
          provide: UsernameGenerationServiceAbstraction,
          useValue: mockLegacyUsernameGenerationService,
        },
        { provide: PlatformUtilsService, useValue: mockPlatformUtilsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VaultGeneratorDialogComponent);
    component = fixture.componentInstance;
  });

  it("should create", () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it("should use the appropriate text based on generator type", () => {
    expect(component["title"]).toBe("passwordGenerator");
    expect(component["selectButtonText"]).toBe("useThisPassword");

    dialogData.type = "username";

    fixture = TestBed.createComponent(VaultGeneratorDialogComponent);
    component = fixture.componentInstance;

    expect(component["title"]).toBe("usernameGenerator");
    expect(component["selectButtonText"]).toBe("useThisUsername");
  });

  it("should close the dialog with the generated value when the user selects it", () => {
    component["generatedValue"] = "generated-value";

    fixture.nativeElement.querySelector("button[data-testid='select-button']").click();

    expect(mockDialogRef.close).toHaveBeenCalledWith({
      action: "selected",
      generatedValue: "generated-value",
    });
  });
});
