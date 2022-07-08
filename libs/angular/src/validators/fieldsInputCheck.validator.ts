import { AbstractControl, FormGroup, ValidatorFn } from "@angular/forms";

import { FormGroupControls } from "@bitwarden/common/abstractions/formValidationErrors.service";

//check to ensure two fields do not have the same value
export function validateInputsDoesntMatch(matchTo: string, errorMessage: string): ValidatorFn {
  return (control: AbstractControl) => {
    if (control.parent && control.parent.controls) {
      return control?.value === (control?.parent?.controls as FormGroupControls)[matchTo].value
        ? {
            inputsMatchError: {
              message: errorMessage,
            },
          }
        : null;
    }

    return null;
  };
}

//check to ensure two fields have the same value
export function validateInputsMatch(matchTo: string, errorMessage: string): ValidatorFn {
  return (control: AbstractControl) => {
    if (control.parent && control.parent.controls) {
      return control?.value === (control?.parent?.controls as FormGroupControls)[matchTo].value
        ? null
        : {
            inputsDoesntMatchError: {
              message: errorMessage,
            },
          };
    }

    return null;
  };
}

//checks if two fields have the same value and validation is controlled from either field
export function validateFormInputsMatch(field: string, fieldMatchTo: string, errorMessage: string) {
  return (formGroup: FormGroup) => {
    const fieldCtrl = formGroup.controls[field];
    const fieldMatchToCtrl = formGroup.controls[fieldMatchTo];

    if (fieldCtrl.value !== fieldMatchToCtrl.value) {
      fieldMatchToCtrl.setErrors({
        inputsDoesntMatchError: {
          message: errorMessage,
        },
      });
    } else {
      fieldMatchToCtrl.setErrors(null);
    }
  };
}
