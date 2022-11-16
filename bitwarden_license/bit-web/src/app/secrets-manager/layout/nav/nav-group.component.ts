import { Component, Input } from "@angular/core";

/**
 * https://www.figma.com/file/Zt3YSeb6E6lebAffrNLa0h/Tailwind-Component-Library?node-id=1717%3A15868&t=GdqiOv7RedSbmRUt-0
 */
@Component({
  selector: "nav-group",
  templateUrl: "./nav-group.component.html",
})
export class NavGroupComponent {
  @Input() title: string;
  @Input() icon: string;
  @Input() to: string;

  protected open = false;

  /**
   * used by [attr.aria-controls]
   */
  protected contentId = Math.random().toString(36).substring(2);

  toggle(event: InputEvent) {
    event.stopPropagation();
    this.open = !this.open;
  }
}
