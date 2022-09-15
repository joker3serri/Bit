import { Component } from "@angular/core";
import { FormsModule, ReactiveFormsModule, Validators, FormBuilder } from "@angular/forms";
import { Meta, moduleMetadata, Story } from "@storybook/angular";
import { delay, of } from "rxjs";

import { I18nService } from "@bitwarden/common/src/abstractions/i18n.service";

import { ButtonModule } from "../button";
import { FormFieldModule } from "../form-field";
import { InputModule } from "../input/input.module";
import { I18nMockService } from "../utils/i18n-mock.service";

import { BitSubmitDirective } from "./async-submit.directive";
import { BitFormButtonDirective } from "./form-button.directive";

const template = `
  <form [formGroup]="formObj" [bitSubmit]="submit">
    <bit-form-field>
      <bit-label>Name</bit-label>
      <input bitInput formControlName="name" />
    </bit-form-field>

    <bit-form-field>
      <bit-label>Email</bit-label>
      <input bitInput formControlName="email" />
    </bit-form-field>

    <button type="submit" bitButton bitFormButton buttonType="primary">Submit</button>
  </form>`;

@Component({
  selector: "app-promise-example",
  template,
})
class PromiseExampleComponent {
  formObj = this.formBuilder.group({
    name: ["", [Validators.required]],
    email: ["", [Validators.required, Validators.email]],
  });

  constructor(private formBuilder: FormBuilder) {}

  submit = async () => {
    this.formObj.markAllAsTouched();

    if (!this.formObj.valid) {
      return;
    }

    await new Promise<void>((resolve, reject) => {
      setTimeout(resolve, 2000);
    });
  };
}

@Component({
  selector: "app-observable-example",
  template,
})
class ObservableExampleComponent {
  formObj = this.formBuilder.group({
    name: ["", [Validators.required]],
    email: ["", [Validators.required, Validators.email]],
  });

  constructor(private formBuilder: FormBuilder) {}

  submit = () => {
    this.formObj.markAllAsTouched();

    if (!this.formObj.valid) {
      return undefined;
    }

    return of("fake observable").pipe(delay(2000));
  };
}

export default {
  title: "Component Library/Form/Button",
  decorators: [
    moduleMetadata({
      declarations: [
        BitSubmitDirective,
        BitFormButtonDirective,
        PromiseExampleComponent,
        ObservableExampleComponent,
      ],
      imports: [FormsModule, ReactiveFormsModule, FormFieldModule, InputModule, ButtonModule],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              required: "required",
              inputRequired: "Input is required.",
              inputEmail: "Input is not an email-address.",
            });
          },
        },
      ],
    }),
  ],
} as Meta;

const PromiseTemplate: Story<PromiseExampleComponent> = (args: PromiseExampleComponent) => ({
  template: `<app-promise-example></app-promise-example>`,
});

export const UsingPromise = PromiseTemplate.bind({});
UsingPromise.props = {};

const ObservableTemplate: Story<PromiseExampleComponent> = (args: PromiseExampleComponent) => ({
  template: `<app-observable-example></app-observable-example>`,
});

export const UsingObservable = ObservableTemplate.bind({});
UsingPromise.props = {};
