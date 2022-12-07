import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormControl, FormGroup, Validators } from "@angular/forms";

import { CryptoFunctionService as CryptoFunctionServiceAbstraction } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { I18nService } from "@bitwarden/common/abstractions/i18n.service";
import { OrganizationDomainResponse } from "@bitwarden/common/abstractions/organization-domain/responses/organization-domain.response";
import { PlatformUtilsService } from "@bitwarden/common/abstractions/platformUtils.service";
import { Utils } from "@bitwarden/common/misc/utils";

import { domainNameValidator } from "./domain-name.validator";
export interface DomainAddEditDialogData {
  organizationId: string;
  orgDomain: OrganizationDomainResponse;
}

@Component({
  selector: "app-domain-add-edit-dialog",
  templateUrl: "domain-add-edit-dialog.component.html",
})
export class DomainAddEditDialogComponent implements OnInit {
  dialogSize: "small" | "default" | "large" = "default";
  disablePadding = false;

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

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: DomainAddEditDialogData,
    private formBuilder: FormBuilder,
    private cryptoFunctionService: CryptoFunctionServiceAbstraction,
    private platformUtilsService: PlatformUtilsService,
    private i18nService: I18nService
  ) {}

  async ngOnInit(): Promise<void> {
    // If we have data.orgDomain, then editing, otherwise creating new domain
    await this.populateForm();
  }

  async populateForm(): Promise<void> {
    if (this.data.orgDomain) {
      // Edit
      this.domainForm.patchValue(this.data.orgDomain);
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

  copyDnsTxt() {
    this.platformUtilsService.copyToClipboard(this.txtCtrl.value);
    this.platformUtilsService.showToast(
      "info",
      null,
      this.i18nService.t("valueCopied", this.i18nService.t("dnsTxtRecord"))
    );
  }
}
