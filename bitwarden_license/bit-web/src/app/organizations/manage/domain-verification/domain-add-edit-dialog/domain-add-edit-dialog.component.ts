import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";

import { OrganizationDomainResponse } from "@bitwarden/common/abstractions/organization-domain/responses/organization-domain.response";

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
    domainName: ["", [Validators.required]],
    txt: [""],
  });

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) public data: DomainAddEditDialogData,
    private formBuilder: FormBuilder
  ) {}

  ngOnInit(): void {
    // If we have data.orgDomain, then editing, otherwise creating new domain
  }
}
