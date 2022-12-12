import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnDestroy, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";
import { Subject, takeUntil } from "rxjs";

import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrgDomainApiServiceAbstraction } from "@bitwarden/common/abstractions/organization-domain/org-domain-api.service.abstraction";
import { OrgDomainServiceAbstraction } from "@bitwarden/common/abstractions/organization-domain/org-domain.service.abstraction";
import { OrganizationDomainResponse } from "@bitwarden/common/abstractions/organization-domain/responses/organization-domain.response";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { Utils } from "@bitwarden/common/misc/utils";
import { OrganizationDomainRequest } from "@bitwarden/common/services/organization-domain/requests/organization-domain.request";

import { domainNameValidator } from "./domain-name.validator";
import { uniqueInArrayValidator } from "./unique-in-array.validator";
export interface DomainAddEditDialogData {
  organizationId: string;
  orgDomain: OrganizationDomainResponse;
  existingDomainNames: Array<string>;
}

@Component({
  selector: "app-domain-add-edit-dialog",
  templateUrl: "domain-add-edit-dialog.component.html",
})
export class DomainAddEditDialogComponent implements OnInit, OnDestroy {
  private componentDestroyed$: Subject<void> = new Subject();
  dialogSize: "small" | "default" | "large" = "default";
  disablePadding = false;

  domainForm: FormGroup = this.formBuilder.group({
    domainName: [
      "",
      [
        Validators.required,
        domainNameValidator(this.i18nService.t("invalidDomainNameMessage")),
        uniqueInArrayValidator(
          this.data.existingDomainNames,
          this.i18nService.t("duplicateDomainError")
        ),
      ],
    ],
    txt: [{ value: null, disabled: true }],
  });

  get domainNameCtrl(): FormControl {
    return this.domainForm.controls.domainName as FormControl;
  }
  get txtCtrl(): FormControl {
    return this.domainForm.controls.txt as FormControl;
  }

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: DomainAddEditDialogData,
    private formBuilder: FormBuilder,
    private cryptoFunctionService: CryptoFunctionServiceAbstraction,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private orgDomainApiService: OrgDomainApiServiceAbstraction,
    private orgDomainService: OrgDomainServiceAbstraction
  ) {}

  async ngOnInit(): Promise<void> {
    // If we have data.orgDomain, then editing, otherwise creating new domain
    await this.populateForm();
  }

  async populateForm(): Promise<void> {
    if (this.data.orgDomain) {
      // Edit
      this.domainForm.patchValue(this.data.orgDomain);
      this.domainForm.disable();
    } else {
      // Add

      // Figuring out the proper length of our DNS TXT Record value was fun.
      // DNS-Based Service Discovery RFC: https://www.ietf.org/rfc/rfc6763.txt; see section 6.1
      // Google uses 43 chars for their TXT record value: https://support.google.com/a/answer/2716802
      // So, chose a magic # of 33 bytes to achieve at least that once converted to base 64 (47 char length).
      const generatedTxt = `bw=${Utils.fromBufferToB64(
        await this.cryptoFunctionService.randomBytes(33)
      )}`;
      this.txtCtrl.setValue(generatedTxt);
    }

    this.setupFormListeners();
  }

  setupFormListeners(): void {
    // By default, <bit-form-field> suppresses touched state on change for reactive form control inputs
    // I want validation errors to be shown as the user types (as validators are running on change anyhow by default).
    this.domainForm.valueChanges.pipe(takeUntil(this.componentDestroyed$)).subscribe(() => {
      this.domainForm.markAllAsTouched();
    });
  }

  copyDnsTxt(): void {
    this.orgDomainService.copyDnsTxt(this.txtCtrl.value);
  }

  // TODO: error handling?

  // TODO: probably will be a need to split into different actions: save == save + verify
  // and if edit true, then verify is verify.

  // Need to display verified status somewhere
  // If verified, no action can be taken but delete
  // If saved & unverified, can prompt verification

  saveDomain = async (): Promise<void> => {
    this.domainForm.disable();

    const request: OrganizationDomainRequest = new OrganizationDomainRequest(
      this.txtCtrl.value,
      this.domainNameCtrl.value
    );

    await this.orgDomainApiService.post(this.data.organizationId, request);

    //TODO: figure out how to handle DomainVerifiedException

    this.platformUtilsService.showToast("success", null, this.i18nService.t("domainSaved"));

    // TODO: verify before closing modal; close if successful
    this.dialogRef.close();
  };

  verifyDomain = async (): Promise<void> => {
    this.domainForm.disable();

    const success: boolean = await this.orgDomainApiService.verify(
      this.data.organizationId,
      this.data.orgDomain.id
    );

    if (success) {
      this.platformUtilsService.showToast("success", null, this.i18nService.t("domainVerified"));
      this.dialogRef.close();
    } else {
      this.platformUtilsService.showToast(
        "error",
        null,
        this.i18nService.t("domainNotVerified", this.domainNameCtrl.value)
      );

      // TODO: discuss with Danielle / Gbubemi:
      // Someone else is using [domain]. Use a different domain to continue.
      // I only have a bool to indicate success or failure.. not why it failed.
    }
  };

  deleteDomain = async (): Promise<void> => {
    const confirmed = await this.platformUtilsService.showDialog(
      this.i18nService.t("removeDomainWarning"),
      this.i18nService.t("removeDomain"),
      this.i18nService.t("yes"),
      this.i18nService.t("no"),
      "warning"
    );
    if (!confirmed) {
      return;
    }

    await this.orgDomainApiService.delete(this.data.organizationId, this.data.orgDomain.id);
    this.platformUtilsService.showToast("success", null, this.i18nService.t("domainRemoved"));

    this.dialogRef.close();
  };

  ngOnDestroy(): void {
    this.componentDestroyed$.next();
    this.componentDestroyed$.complete();
  }
}
