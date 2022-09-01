import { DialogRef, DIALOG_DATA } from "@angular/cdk/dialog";
import { Component, Inject, OnInit } from "@angular/core";
import { FormControl, FormGroup, Validators } from "@angular/forms";

import { SecretView } from "@bitwarden/common/models/view/secretView";

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
    const secret: SecretView = await this.secretService.getBySecretId(this.data?.secretId);
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
      const secretView = new SecretView();
      secretView.organizationId = this.data?.organizationId;
      secretView.name = this.form.value.name.toString();
      secretView.value = this.form.value.value.toString();
      secretView.note = this.form.value.notes.toString();
      await this.secretService.create(this.data?.organizationId, secretView);
    } catch (e) {
      this.dialogRef.close("create-failure");
    }
    this.dialogRef.close("create-success");
  }

  private async updateSecret() {
    try {
      const secretView = new SecretView();
      secretView.id = this.data?.secretId;
      secretView.organizationId = this.data?.organizationId;
      secretView.name = this.form.value.name.toString();
      secretView.value = this.form.value.value.toString();
      secretView.note = this.form.value.notes.toString();
      await this.secretService.update(this.data?.organizationId, secretView);
    } catch (e) {
      this.dialogRef.close("edit-failure");
    }
    this.dialogRef.close("edit-success");
  }
}
