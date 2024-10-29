import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { FormBuilder, ReactiveFormsModule } from "@angular/forms";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import {
  AsyncActionsModule,
  ButtonModule,
  CheckboxModule,
  FormFieldModule,
} from "@bitwarden/components";

@Component({
  standalone: true,
  templateUrl: "./login-decryption-options.component.html",
  imports: [
    AsyncActionsModule,
    ButtonModule,
    CheckboxModule,
    CommonModule,
    FormFieldModule,
    JslibModule,
    ReactiveFormsModule,
  ],
})
export class LoginDecryptionOptionsComponent implements OnInit {
  loading = false;

  formGroup = this.formBuilder.group({
    rememberDevice: [true],
  });

  constructor(private formBuilder: FormBuilder) {}

  ngOnInit(): void {}

  submit = () => {};
}
