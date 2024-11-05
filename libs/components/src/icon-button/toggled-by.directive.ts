import { Directive, HostBinding, Input, OnInit } from "@angular/core";

import { BitIconButtonComponent } from "./icon-button.component";

let nextId = 0;

@Directive({
  selector: "[bitToggledBy]",
  exportAs: "iconButtonToggledBy",
  standalone: true,
})
export class IconButtonToggledByDirective implements OnInit {
  @Input("bitToggledBy") iconButton: BitIconButtonComponent;

  @HostBinding("id") id = `bit-toggled-by-${nextId++}`;

  @HostBinding("class") classList = "";

  ngOnInit() {
    this.iconButton.controls = this.id;
    this.iconButton.click = this.iconButtonClick.bind(this);

    this.setElementVisibility();
  }

  iconButtonClick() {
    if (this.iconButton.expanded !== null) {
      this.iconButton.expanded = !this.iconButton.expanded;
    }

    this.setElementVisibility();
  }

  setElementVisibility() {
    if (this.iconButton.expanded === false) {
      this.classList = "tw-hidden";
    }

    if (this.iconButton.expanded) {
      this.classList = "";
    }
  }
}
