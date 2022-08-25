import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";

import { CreateSecretRequest } from "../requests/create-secret.request";
import { SecretApiService } from "../secret-api.service";
import { SecretService } from "../secret.service";

interface SecretOperation {
  operation: "add" | "edit";
  data: string;
  organizationId: string;
}

@Component({
  selector: "sm-secret-dialog",
  templateUrl: "./secret-dialog.component.html",
})
export class SecretDialogComponent {
  form = new FormGroup({
    name: new FormControl(""),
    value: new FormControl(""),
    notes: new FormControl(""),
  });

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) private data: SecretOperation,
    private secretsApiService: SecretApiService,
    private secretService: SecretService
  ) {}

  get title() {
    if (this.data?.operation === "add") {
      return "Add Secret";
    }
    return "Edit Secret";
  }

  async onSave() {
    if (this.data?.operation === "add") {
      this.createSecret();
    }
    this.dialogRef.close();
    window.location.reload();
  }

  private async createSecret() {
    let creationRequest: CreateSecretRequest = new CreateSecretRequest();
    creationRequest.organizationId = this.data?.organizationId;
    creationRequest.key = this.form.value.name.toString();
    creationRequest.value = this.form.value.value.toString();
    creationRequest.note = this.form.value.notes.toString();
    creationRequest = await this.secretService.encryptCreationRequest(creationRequest);
    await this.secretsApiService.createSecret(this.data?.organizationId, creationRequest);
  }
}
