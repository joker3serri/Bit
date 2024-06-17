import { Component } from "@angular/core";
import { FormControlStatus } from "@angular/forms";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { ButtonModule } from "@bitwarden/components";

import { PopOutComponent } from "../../../../../platform/popup/components/pop-out.component";
import { PopupFooterComponent } from "../../../../../platform/popup/layout/popup-footer.component";
import { PopupHeaderComponent } from "../../../../../platform/popup/layout/popup-header.component";
import { PopupPageComponent } from "../../../../../platform/popup/layout/popup-page.component";

import { CipherAttachmentsComponent } from "./cipher-attachments/cipher-attachments.component";

@Component({
  standalone: true,
  selector: "app-attachments",
  templateUrl: "./attachments-v2.component.html",
  imports: [
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
  attachmentFormStatus: FormControlStatus;

  /** The `id` tied to the underlying HTMLFormElement */
  attachmentFormId = CipherAttachmentsComponent.attachmentFormID;
}
