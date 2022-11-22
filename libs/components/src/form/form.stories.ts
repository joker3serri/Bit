import {
  AbstractControl,
  FormsModule,
  ReactiveFormsModule,
  ValidationErrors,
  ValidatorFn,
  Validators,
  FormBuilder,
} from "@angular/forms";
import { Meta, moduleMetadata, Story } from "@storybook/angular";

import { I18nService } from "@bitwarden/common/abstractions/i18n.service";

import { ButtonModule } from "../button";
import { CheckboxModule } from "../checkbox";
import { FormControlModule } from "../form-control";
import { FormFieldModule } from "../form-field";
import { InputModule } from "../input/input.module";
import { RadioButtonModule } from "../radio-button";
import { I18nMockService } from "../utils/i18n-mock.service";

export default {
  title: "Component Library/Form",
  decorators: [
    moduleMetadata({
      imports: [
        FormsModule,
        ReactiveFormsModule,
        FormFieldModule,
        InputModule,
        ButtonModule,
        FormControlModule,
        CheckboxModule,
        RadioButtonModule,
      ],
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
  parameters: {
    design: {
      type: "figma",
      url: "https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=1881%3A17689",
    },
  },
} as Meta;

const fb = new FormBuilder();
const example1FormObj = fb.group({
  name: ["", [Validators.required]],
  email: ["", [Validators.required, Validators.email, forbiddenNameValidator(/bit/i)]],
  terms: [false, [Validators.requiredTrue]],
  updates: ["yes"],
});

// Custom error message, `message` is shown as the error message
function forbiddenNameValidator(nameRe: RegExp): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const forbidden = nameRe.test(control.value);
    return forbidden ? { forbiddenName: { message: "forbiddenName" } } : null;
  };
}

const FullExample1Template: Story = (args) => ({
  props: {
    formObj: example1FormObj,
    submit: () => example1FormObj.markAllAsTouched(),
    ...args,
  },
  template: `
    <form [formGroup]="formObj" (ngSubmit)="submit()">
      <bit-form-field>
        <bit-label>Name</bit-label>
        <input bitInput formControlName="name" />
      </bit-form-field>

      <bit-form-field>
        <bit-label>Email</bit-label>
        <input bitInput formControlName="email" />
      </bit-form-field>

      <bit-form-control>
        <input type="checkbox" bitCheckbox formControlName="terms">
        <bit-form-control-label>Agree to terms</bit-form-control-label>
      </bit-form-control>

      <bit-form-field>
        <bit-label>Subscribe to updates?</bit-label>
        <bit-radio-group formControlName="updates">
          <bit-radio-button value="yes">Yes</bit-radio-button>
          <bit-radio-button value="no">No</bit-radio-button>
          <bit-radio-button value="later">Decide later</bit-radio-button>
        </bit-radio-group>
      </bit-form-field>

      <button type="submit" bitButton buttonType="primary">Submit</button>
    </form>
  `,
});

export const FullExample1 = FullExample1Template.bind({});
