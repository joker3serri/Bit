import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrgDomainApiServiceAbstraction } from "@bitwarden/common/abstractions/organization-domain/org-domain-api.service.abstraction";
import { OrganizationDomainResponse } from "@bitwarden/common/abstractions/organization-domain/responses/organization-domain.response";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { Utils } from "@bitwarden/common/misc/utils";
import { OrganizationDomainRequest } from "@bitwarden/common/services/organization-domain/requests/organization-domain.request";

import { domainNameValidator } from "./domain-name.validator";
export interface DomainAddEditDialogData {
  organizationId: string;
  orgDomain: OrganizationDomainResponse;
  existingDomainNames: Array<string>;
}

@Component({
  selector: "app-domain-add-edit-dialog",
  templateUrl: "domain-add-edit-dialog.component.html",
})
export class DomainAddEditDialogComponent implements OnInit {
  dialogSize: "small" | "default" | "large" = "default";
  disablePadding = false;

  // TODO: should invalidDomainNameMessage have something like: "'https://', 'http://', or 'www.' domain prefixes not allowed."
  // TODO: write separate uniqueIn validator w/ translated msg: "You can’t claim the same domain twice."
  domainForm: FormGroup = this.formBuilder.group({
    domainName: [
      "",
      [Validators.required, domainNameValidator(this.i18nService.t("invalidDomainNameMessage"))],
    ],
    txt: [{ value: null, disabled: true }],
  });

  get domainNameCtrl(): FormControl {
    return this.domainForm.controls.domainName as FormControl;
  }
  get txtCtrl(): FormControl {
    return this.domainForm.controls.txt as FormControl;
  }

  submitting = false;
  deleting = false;

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: DomainAddEditDialogData,
    private formBuilder: FormBuilder,
    private cryptoFunctionService: CryptoFunctionServiceAbstraction,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService,
    private orgDomainApiService: OrgDomainApiServiceAbstraction
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
  }

  copyDnsTxt(): void {
    this.platformUtilsService.copyToClipboard(this.txtCtrl.value);
    this.platformUtilsService.showToast(
      "success",
      null,
      this.i18nService.t("valueCopied", this.i18nService.t("dnsTxtRecord"))
    );
  }

  // TODO: error handling?

  // TODO: probably will be a need to split into different actions: save == save + verify
  // and if edit true, then verify is verify.

  // Need to display verified status somewhere
  // If verified, no action can be taken but delete
  // If saved & unverified, can prompt verification

  async saveDomain(): Promise<void> {
    this.submitting = true;
    this.domainForm.disable();

    const request: OrganizationDomainRequest = new OrganizationDomainRequest(
      this.txtCtrl.value,
      this.domainNameCtrl.value
    );

    await this.orgDomainApiService.post(this.data.organizationId, request);

    //TODO: figure out how to handle DomainVerifiedException

    this.platformUtilsService.showToast("success", null, this.i18nService.t("domainSaved"));
    this.submitting = false;

    // TODO: verify before closing modal; close if successful
    this.dialogRef.close();
  }

  async verifyDomain(): Promise<void> {
    this.submitting = true;
    this.domainForm.disable();

    const success: boolean = await this.orgDomainApiService.verify(
      this.data.organizationId,
      this.data.orgDomain.id
    );

    this.submitting = false;

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
  }

  async deleteDomain(): Promise<void> {
    // TODO: Do I need an are you sure prompt?

    this.deleting = true;
    await this.orgDomainApiService.delete(this.data.organizationId, this.data.orgDomain.id);
    this.deleting = false;
    this.platformUtilsService.showToast("success", null, this.i18nService.t("domainRemoved"));
    this.dialogRef.close();
  }
}
