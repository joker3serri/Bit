import { LiveAnnouncer } from "@angular/cdk/a11y";
import { ComponentFixture, TestBed } from "@angular/core/testing";
import { mock, MockProxy } from "jest-mock-extended";
import { BehaviorSubject } from "rxjs";

import { DomainSettingsService } from "@bitwarden/common/autofill/services/domain-settings.service";
import { UriMatchStrategy } from "@bitwarden/common/models/domain/domain-service";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";
import { LoginUriView } from "@bitwarden/common/vault/models/view/login-uri.view";
import { LoginView } from "@bitwarden/common/vault/models/view/login.view";

import { CipherFormContainer } from "../../cipher-form-container";

import { AutofillOptionsComponent } from "./autofill-options.component";

describe("AutofillOptionsComponent", () => {
  let component: AutofillOptionsComponent;
  let fixture: ComponentFixture<AutofillOptionsComponent>;

  let cipherFormContainer: MockProxy<CipherFormContainer>;
  let liveAnnouncer: MockProxy<LiveAnnouncer>;
  let domainSettingsService: MockProxy<DomainSettingsService>;

  beforeEach(async () => {
    cipherFormContainer = mock<CipherFormContainer>();
    liveAnnouncer = mock<LiveAnnouncer>();
    domainSettingsService = mock<DomainSettingsService>();
    domainSettingsService.defaultUriMatchStrategy$ = new BehaviorSubject(null);

    await TestBed.configureTestingModule({
      imports: [AutofillOptionsComponent],
      providers: [
        { provide: CipherFormContainer, useValue: cipherFormContainer },
        {
          provide: I18nService,
          useValue: { t: (...keys: string[]) => keys.filter(Boolean).join(" ") },
        },
        { provide: LiveAnnouncer, useValue: liveAnnouncer },
        { provide: DomainSettingsService, useValue: domainSettingsService },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(AutofillOptionsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it("should create", () => {
    expect(component).toBeTruthy();
  });

  it("registers 'autoFillOptionsForm' form with CipherFormContainer", () => {
    fixture.detectChanges();
    expect(cipherFormContainer.registerChildForm).toHaveBeenCalledWith(
      "autoFillOptions",
      component.autofillOptionsForm,
    );
  });

  it("patches 'autoFillOptionsForm' changes to CipherFormContainer", () => {
    fixture.detectChanges();

    component.autofillOptionsForm.patchValue({
      uris: [{ uri: "https://example.com", matchDetection: UriMatchStrategy.Exact }],
    });

    expect(cipherFormContainer.patchCipher).toHaveBeenCalled();
    const patchFn = cipherFormContainer.patchCipher.mock.lastCall[0];

    const updatedCipher = patchFn(new CipherView());

    const expectedUri = Object.assign(new LoginUriView(), {
      uri: "https://example.com",
      match: UriMatchStrategy.Exact,
    } as LoginUriView);

    expect(updatedCipher.login.uris).toEqual([expectedUri]);
  });

  it("disables 'autoFillOptionsForm' when in partial-edit mode", () => {
    cipherFormContainer.config.mode = "partial-edit";

    fixture.detectChanges();

    expect(component.autofillOptionsForm.disabled).toBe(true);
  });

  it("initializes 'autoFillOptionsForm' with original login URIs", () => {
    const existingLogin = new LoginUriView();
    existingLogin.uri = "https://example.com";
    existingLogin.match = UriMatchStrategy.Exact;

    (cipherFormContainer.originalCipherView as CipherView) = new CipherView();
    cipherFormContainer.originalCipherView.login = {
      uris: [existingLogin],
    } as LoginView;

    fixture.detectChanges();

    expect(component.autofillOptionsForm.value.uris).toEqual([
      { uri: "https://example.com", matchDetection: UriMatchStrategy.Exact },
    ]);
  });

  it("initializes 'autoFillOptionsForm' with initialValues when creating a new cipher", () => {
    cipherFormContainer.config.initialValues = { loginUri: "https://example.com" };

    fixture.detectChanges();

    expect(component.autofillOptionsForm.value.uris).toEqual([
      { uri: "https://example.com", matchDetection: null },
    ]);
  });

  it("initializes 'autoFillOptionsForm' with an empty URI when creating a new cipher", () => {
    cipherFormContainer.config.initialValues = null;

    fixture.detectChanges();

    expect(component.autofillOptionsForm.value.uris).toEqual([{ uri: null, matchDetection: null }]);
  });

  it("announces the addition of a new URI input", () => {
    fixture.detectChanges();

    component.addUri(undefined, true);

    fixture.detectChanges();

    expect(liveAnnouncer.announce).toHaveBeenCalledWith("websiteAdded", "polite");
  });

  it("removes URI input when remove() is called", () => {
    fixture.detectChanges();

    // Add second Uri
    component.addUri(undefined, true);

    fixture.detectChanges();

    // Remove first Uri
    component.removeUri(0);

    fixture.detectChanges();

    expect(component.autofillOptionsForm.value.uris.length).toEqual(1);
  });
});
