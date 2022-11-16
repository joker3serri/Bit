import { Component, Input } from "@angular/core";

@Component({
  selector: "nav-item",
  templateUrl: "./nav-item.component.html",
})
export class NavItemComponent {
  @Input() title: string;
  @Input() icon: string;
  @Input() to: string;

  protected routerLinkActiveOptions = {
    paths: "subset",
    queryParams: "exact",
    fragment: "ignored",
    matrixParams: "ignored",
  };
}
