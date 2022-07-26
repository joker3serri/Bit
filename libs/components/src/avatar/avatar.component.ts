import { Component, Input, OnChanges } from "@angular/core";
import { DomSanitizer, SafeResourceUrl } from "@angular/platform-browser";

import { Utils } from "@bitwarden/common/misc/utils";

type SizeTypes = "large" | "default" | "small";

@Component({
  selector: "bit-avatar",
  template: `<img *ngIf="src" [src]="src" title="{{ data }}" [ngClass]="classList" />`,
})
export class AvatarComponent implements OnChanges {
  @Input() border = false;
  @Input() color: "#175ddc";
  @Input() data: string;
  @Input() email: string;
  @Input() size: SizeTypes = "default";

  private svgCharCount = 2;
  private svgFontSize = 20;
  private svgFontWeight = 300;
  private svgSize = 48;
  src: SafeResourceUrl;

  constructor(public sanitizer: DomSanitizer) {}

  ngOnChanges() {
    this.generate();
  }

  get classList(): string[] {
    const classes = ["tw-rounded-full"];

    switch (this.size) {
      case "large":
        classes.push("tw-h-16", "tw-w-16");
        break;
      case "small":
        classes.push("tw-h-7", "tw-w-7");
        break;
      default:
        classes.push("tw-h-12", "tw-w-12");
    }

    if (this.border) {
      classes.push("tw-border", "tw-border-solid", "tw-border-secondary-500");
    }

    return classes;
  }

  private generate() {
    let chars: string = null;
    const upperData = this.data.toUpperCase();

    chars = this.getFirstLetters(upperData, this.svgCharCount);

    if (chars == null) {
      chars = this.unicodeSafeSubstring(upperData, this.svgCharCount);
    }

    // If the chars contain an emoji, only show it.
    if (chars.match(Utils.regexpEmojiPresentation)) {
      chars = chars.match(Utils.regexpEmojiPresentation)[0];
    }

    const charObj = this.createTextElement(chars);
    const svg = this.createSvgElement(this.svgSize, this.color);
    svg.appendChild(charObj);
    const html = window.document.createElement("div").appendChild(svg).outerHTML;
    const svgHtml = window.btoa(unescape(encodeURIComponent(html)));
    this.src = this.sanitizer.bypassSecurityTrustResourceUrl(
      "data:image/svg+xml;base64," + svgHtml
    );
  }

  private getFirstLetters(data: string, count: number): string {
    const parts = data.split(" ");
    if (parts.length > 1) {
      let text = "";
      for (let i = 0; i < count; i++) {
        text += this.unicodeSafeSubstring(parts[i], 1);
      }
      return text;
    }
    return null;
  }

  private createSvgElement(size: number, color: string): HTMLElement {
    const svgTag = window.document.createElement("svg");
    svgTag.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    svgTag.setAttribute("pointer-events", "none");
    svgTag.setAttribute("width", size.toString());
    svgTag.setAttribute("height", size.toString());
    svgTag.style.backgroundColor = color;
    svgTag.style.width = size + "px";
    svgTag.style.height = size + "px";
    return svgTag;
  }

  private createTextElement(character: string): HTMLElement {
    const textTag = window.document.createElement("text");
    textTag.setAttribute("text-anchor", "middle");
    textTag.setAttribute("y", "50%");
    textTag.setAttribute("x", "50%");
    textTag.setAttribute("dy", "0.35em");
    textTag.setAttribute("pointer-events", "auto");
    textTag.setAttribute("fill", Utils.pickTextColorBasedOnBgColor(this.color, 135, true));
    textTag.setAttribute(
      "font-family",
      '"Open Sans","Helvetica Neue",Helvetica,Arial,' +
        'sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
    );
    textTag.textContent = character;
    textTag.style.fontWeight = this.svgFontWeight.toString();
    textTag.style.fontSize = this.svgFontSize + "px";
    return textTag;
  }

  private unicodeSafeSubstring(str: string, count: number) {
    const characters = str.match(/./gu);
    return characters != null ? characters.slice(0, count).join("") : "";
  }
}
