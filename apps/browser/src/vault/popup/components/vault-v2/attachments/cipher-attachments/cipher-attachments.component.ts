import { Component, EventEmitter, Output } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import {
  FormBuilder,
  FormControl,
  FormControlStatus,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from "@angular/forms";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ButtonModule, CardComponent, TypographyModule } from "@bitwarden/components";

type CipherAttachmentForm = FormGroup<{
  file: FormControl<File | null>;
}>;

@Component({
  standalone: true,
  selector: "app-cipher-attachments",
  templateUrl: "./cipher-attachments.component.html",
  imports: [ButtonModule, JslibModule, ReactiveFormsModule, TypographyModule, CardComponent],
})
export class CipherAttachmentsComponent {
  /** `id` associated with the form element */
  static attachmentFormID = "attachmentForm";

  /** Emits the status of the attachment form */
  @Output() formStatusChange = new EventEmitter<FormControlStatus>();

  attachmentForm: CipherAttachmentForm = this.formBuilder.group({
    file: new FormControl<File>(null, [Validators.required]),
  });

  constructor(private formBuilder: FormBuilder) {
    this.attachmentForm.statusChanges.pipe(takeUntilDestroyed()).subscribe((status) => {
      this.formStatusChange.emit(status);
    });
  }

  /** Reference the `id` via the static property */
  get attachmentFormId(): string {
    return CipherAttachmentsComponent.attachmentFormID;
  }

  /** Updates the form value when a file is selected */
  onFileChange(event: Event): void {
    const fileInputEl = event.target as HTMLInputElement;

    if (fileInputEl.files && fileInputEl.files.length > 0) {
      this.attachmentForm.controls.file.setValue(fileInputEl.files[0]);
    }
  }
}
