import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { ButtonModule } from "../../../button";
import { CheckboxModule } from "../../../checkbox";
import { ColorPasswordModule } from "../../../color-password";
import { DialogService, SimpleDialogOptions } from "../../../dialog";
import { FormControlModule } from "../../../form-control";
import { FormFieldModule } from "../../../form-field";
import { IconButtonModule } from "../../../icon-button";
import { InputModule } from "../../../input";
import { PopoverModule } from "../../../popover";
import { ProgressModule } from "../../../progress";
import { RadioButtonModule } from "../../../radio-button";
import { SelectModule } from "../../../select";
import { I18nMockService } from "../../../utils/i18n-mock.service";

@Component({
  standalone: true,
  selector: "bit-kitchen-sink-form",
  imports: [
    ButtonModule,
    CheckboxModule,
    ColorPasswordModule,
    CommonModule,
    FormControlModule,
    FormFieldModule,
    FormsModule,
    IconButtonModule,
    InputModule,
    PopoverModule,
    ProgressModule,
    RadioButtonModule,
    ReactiveFormsModule,
    SelectModule,
  ],
  providers: [
    DialogService,
    {
      provide: I18nService,
      useFactory: () => {
        return new I18nMockService({
          close: "Close",
          checkboxRequired: "Option is required",
          fieldsNeedAttention: "__$1__ field(s) above need your attention.",
          inputEmail: "Input is not an email-address.",
          inputMaxValue: (max) => `Input value must not exceed ${max}.`,
          inputMinValue: (min) => `Input value must be at least ${min}.`,
          inputRequired: "Input is required.",
          multiSelectClearAll: "Clear all",
          multiSelectLoading: "Retrieving options...",
          multiSelectNotFound: "No items found",
          multiSelectPlaceholder: "-- Type to Filter --",
          required: "required",
          selectPlaceholder: "-- Select --",
          toggleVisibility: "Toggle visibility",
        });
      },
    },
  ],
  template: `<form [formGroup]="formObj" (ngSubmit)="submit()">
    <div class="tw-mb-6">
      <bit-progress [barWidth]="50"></bit-progress>
    </div>

    <bit-form-field>
      <bit-label>Your favorite feature</bit-label>
      <input bitInput formControlName="favFeature" />
    </bit-form-field>

    <bit-form-field>
      <bit-label>Your favorite color</bit-label>
      <bit-select formControlName="favColor">
        <bit-option
          *ngFor="let color of colors"
          [value]="color.value"
          [label]="color.name"
        ></bit-option>
      </bit-select>
    </bit-form-field>

    <bit-form-field>
      <bit-label>Your top 3 worst passwords</bit-label>
      <bit-multi-select
        class="tw-w-full"
        formControlName="topWorstPasswords"
        [baseItems]="worstPasswords"
      >
      </bit-multi-select>
    </bit-form-field>

    <bit-form-field>
      <bit-label>How many passwords do you have?</bit-label>
      <input bitInput type="number" formControlName="numPasswords" min="0" max="150" />
    </bit-form-field>

    <bit-form-field>
      <bit-label>
        A random password
        <button
          type="button"
          class="tw-border-none tw-bg-transparent tw-text-primary-500"
          [bitPopoverTriggerFor]="myPopover"
          #triggerRef="popoverTrigger"
        >
          <i class="bwi bwi-question-circle"></i>
        </button>
      </bit-label>
      <input bitInput type="password" formControlName="password" />
      <button type="button" bitIconButton bitSuffix bitPasswordInputToggle></button>
    </bit-form-field>

    <div class="tw-mb-6">
      <span bitTypography="body1" class="tw-text-main">
        An example of a strong password: &nbsp;
      </span>

      <bit-color-password
        class="tw-text-base"
        [password]="'Wq$Jk😀7j  DX#rS5Sdi!z'"
        [showCount]="true"
      ></bit-color-password>
    </div>

    <bit-form-control>
      <bit-label>Check if you love security</bit-label>
      <input type="checkbox" bitCheckbox formControlName="loveSecurity" />
      <bit-hint>Required!!!!!</bit-hint>
    </bit-form-control>

    <bit-radio-group formControlName="current">
      <bit-label>Do you currently use Bitwarden?</bit-label>
      <bit-radio-button value="yes">
        <bit-label>Yes</bit-label>
      </bit-radio-button>
      <bit-radio-button value="no">
        <bit-label>No</bit-label>
      </bit-radio-button>
    </bit-radio-group>

    <button bitButton buttonType="primary" (click)="(submit)">Submit</button>
    <bit-error-summary [formGroup]="formObj"></bit-error-summary>

    <bit-popover [title]="'Password help'" #myPopover>
      <div>A strong password has the following:</div>
      <ul class="tw-mt-2 tw-mb-0 tw-pl-4">
        <li>Letters</li>
        <li>Numbers</li>
        <li>Special characters</li>
      </ul>
    </bit-popover>
  </form>`,
})
export class KitchenSinkForm {
  constructor(public dialogService: DialogService) {}

  protected dialog: SimpleDialogOptions = {
    title: "Confirm",
    content: "Are you sure you want to submit?",
    type: "primary",
    acceptButtonText: "Yes",
    cancelButtonText: "No",
    acceptAction: async () => this.acceptDialog(),
  };

  formObj = new FormBuilder().group({
    favFeature: ["", [Validators.required]],
    favColor: [undefined as string | undefined, [Validators.required]],
    topWorstPasswords: [undefined as string | undefined],
    loveSecurity: [false, [Validators.requiredTrue]],
    current: ["yes"],
    numPasswords: [null, [Validators.min(0), Validators.max(150)]],
    password: ["", [Validators.required]],
  });

  async submit() {
    await this.dialogService.openSimpleDialog(this.dialog);
  }

  acceptDialog() {
    this.formObj.markAllAsTouched();
    this.dialogService.closeAll();
  }

  colors = [
    { value: "blue", name: "Blue" },
    { value: "white", name: "White" },
    { value: "gray", name: "Gray" },
  ];

  worstPasswords = [
    { id: "1", listName: "1234", labelName: "1234" },
    { id: "2", listName: "admin", labelName: "admin" },
    { id: "3", listName: "password", labelName: "password" },
  ];
}
