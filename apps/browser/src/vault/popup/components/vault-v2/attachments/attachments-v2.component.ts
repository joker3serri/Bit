import { CommonModule } from "@angular/common";
import { Component } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { FormControlStatus } from "@angular/forms";
import { ActivatedRoute } from "@angular/router";
import { first } from "rxjs";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { CipherId } from "@bitwarden/common/types/guid";
import { ButtonModule } from "@bitwarden/components";

import { PopOutComponent } from "../../../../../platform/popup/components/pop-out.component";
import { PopupFooterComponent } from "../../../../../platform/popup/layout/popup-footer.component";
import { PopupHeaderComponent } from "../../../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "../../../../../platform/popup/layout/popup-page.component";

import { CipherAttachmentsComponent } from "./cipher-attachments/cipher-attachments.component";

@Component({
  standalone: true,
  selector: "app-attachments-v2",
  templateUrl: "./attachments-v2.component.html",
  imports: [
    CommonModule,
    ButtonModule,
    JslibModule,
    CipherAttachmentsComponent,
    PopupPageComponent,
    PopupHeaderComponent,
    PopupFooterComponent,
    PopOutComponent,
  ],
})
export class AttachmentsV2Component {
  /** The status for the attachment form */
  protected attachmentFormStatus: FormControlStatus;

  /** Loading state of the attachment form */
  protected loading = false;

  /** Disabled state of the attachment form */
  protected disabled = false;

  /** The `id` tied to the underlying HTMLFormElement */
  attachmentFormId = CipherAttachmentsComponent.attachmentFormID;

  /** Id of the cipher */
  cipherId: CipherId;

  constructor(route: ActivatedRoute) {
    route.queryParams.pipe(takeUntilDestroyed(), first()).subscribe(({ cipherId }) => {
      this.cipherId = cipherId;
    });
  }
}
