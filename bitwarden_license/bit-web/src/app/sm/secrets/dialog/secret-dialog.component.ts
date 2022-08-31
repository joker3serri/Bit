import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { CreateSecretRequest } from "../requests/create-secret.request";
import { UpdateSecretRequest } from "../requests/update-secret.request";
import { SecretResponse } from "../responses/secret.response";
import { SecretApiService } from "../secret-api.service";
import { SecretService } from "../secret.service";

interface SecretOperation {
  organizationId: string;
  operation: "add" | "edit";
  secretId?: string;
}

@Component({
  selector: "sm-secret-dialog",
  templateUrl: "./secret-dialog.component.html",
})
export class SecretDialogComponent implements OnInit {
  form = new FormGroup({
    name: new FormControl("", [Validators.required]),
    value: new FormControl("", [Validators.required]),
    notes: new FormControl(""),
  });

  constructor(
    public dialogRef: DialogRef,
    @Inject(DIALOG_DATA) private data: SecretOperation,
    private secretsApiService: SecretApiService,
    private secretService: SecretService
  ) {}

  async ngOnInit() {
    if (this.data?.operation === "edit" && this.data?.secretId) {
      await this.loadData();
    } else if (this.data?.operation !== "add") {
      throw new Error(`The secret dialog was not called with the appropriate operation values.`);
    }
  }

  async loadData() {
    let secret: SecretResponse = await this.secretsApiService.getSecret(this.data?.secretId);
    secret = await this.secretService.decryptSecretResponse(secret);
    this.form.setValue({ name: secret.name, value: secret.value, notes: secret.note });
  }

  get title() {
    if (this.data?.operation === "add") {
      return "addSecret";
    }
    return "editSecret";
  }

  async onSave() {
    if (this.data?.operation === "add") {
      await this.createSecret();
    } else if (this.data?.operation === "edit" && this.data?.secretId) {
      await this.updateSecret();
    }
  }

  private async createSecret() {
    try {
      let request: CreateSecretRequest = new CreateSecretRequest();
      request.organizationId = this.data?.organizationId;
      request = this.getFormValues(request) as CreateSecretRequest;
      request = (await this.secretService.encryptRequest(
        request.organizationId,
        request
      )) as CreateSecretRequest;
      await this.secretsApiService.createSecret(this.data?.organizationId, request);
    } catch (e) {
      this.dialogRef.close("create-failure");
    }
    this.dialogRef.close("create-success");
  }

  private async updateSecret() {
    try {
      let request: UpdateSecretRequest = new UpdateSecretRequest();
      request = this.getFormValues(request) as UpdateSecretRequest;
      request = (await this.secretService.encryptRequest(
        this.data?.organizationId,
        request
      )) as UpdateSecretRequest;
      await this.secretsApiService.updateSecret(this.data?.secretId, request);
    } catch (e) {
      this.dialogRef.close("edit-failure");
    }
    this.dialogRef.close("edit-success");
  }

  private getFormValues(request: CreateSecretRequest | UpdateSecretRequest) {
    request.key = this.form.value.name.toString();
    request.value = this.form.value.value.toString();
    request.note = this.form.value.notes.toString();
    return request;
  }
}
