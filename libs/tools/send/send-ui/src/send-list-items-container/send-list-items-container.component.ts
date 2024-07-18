import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { RouterLink } from "@angular/router";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { SendType } from "@bitwarden/common/tools/send/enums/send-type";
import { SendView } from "@bitwarden/common/tools/send/models/view/send.view";
import {
  BadgeModule,
  ButtonModule,
  IconButtonModule,
  ItemModule,
  SectionComponent,
  SectionHeaderComponent,
  TypographyModule,
} from "@bitwarden/components";

import { ContainerComponent } from "../../../../../components/src/container/container.component";

@Component({
  imports: [
    CommonModule,
    ItemModule,
    ButtonModule,
    BadgeModule,
    IconButtonModule,
    SectionComponent,
    TypographyModule,
    JslibModule,
    SectionHeaderComponent,
    RouterLink,
    ContainerComponent,
  ],
  selector: "app-send-list-items-container",
  templateUrl: "send-list-items-container.component.html",
  standalone: true,
})
export class SendListItemsContainerComponent {
  sendType = SendType;
  /**
   * The list of sends to display.
   */
  @Input()
  sends: SendView[] = [];
}
