import { Component, Input, OnDestroy } from "@angular/core";
import { Observable, Subject } from "rxjs";

import { AvatarService } from "@bitwarden/common/abstractions/avatar.service";

import { SharedModule } from "../shared";

type SizeTypes = "xlarge" | "large" | "default" | "small" | "xsmall";
@Component({
  selector: "dynamic-avatar",
  standalone: true,
  imports: [SharedModule],
  template: `<span [title]="title">
    <bit-avatar
      appStopClick
      [text]="text"
      [size]="size"
      [color]="color$ | async"
      [border]="border"
      [id]="id"
      [title]="title"
    >
    </bit-avatar>
  </span>`,
})
export class DynamicAvatarComponent implements OnDestroy {
  @Input() border = false;
  @Input() id: string;
  @Input() text: string;
  @Input() title: string;
  @Input() size: SizeTypes = "default";
  color$: Observable<string | null>;
  private destroy$ = new Subject<void>();

  constructor(private avatarService: AvatarService) {
    if (this.text) {
      this.text = this.text.toUpperCase();
    }
    this.color$ = this.avatarService.avatarUpdate$;
  }

  async ngOnDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
