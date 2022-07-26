import { Component, Input, OnChanges } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { Utils } from "@bitwarden/common/misc/utils";

type SizeTypes = "large" | "default" | "small";

@Component({
  selector: "bit-avatar",
  template: `
    <img
      *ngIf="src"
      [src]="sanitizer.bypassSecurityTrustResourceUrl(src)"
      title="{{ data }}"
      [ngClass]="classList"
    />
  `,
})
export class AvatarComponent implements OnChanges {
  @Input() border = false;
  @Input() color: "#175ddc";
  @Input() data: string;
  @Input() email: string;
  @Input() size: SizeTypes = "default";

  charCount = 2;
  fontSize = 20;
  fontWeight = 300;
  svgSize = 48;
  src: string;

  constructor(
    public sanitizer: DomSanitizer,
    private cryptoFunctionService: CryptoFunctionService,
    private stateService: StateService
  ) {}

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

    if (this.charCount > 1) {
      chars = this.getFirstLetters(upperData, this.charCount);
    }
    if (chars == null) {
      chars = this.unicodeSafeSubstring(upperData, this.charCount);
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
    this.src = "data:image/svg+xml;base64," + svgHtml;
  }

  private stringToColor(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    let color = "#";
    for (let i = 0; i < 3; i++) {
      const value = (hash >> (i * 8)) & 0xff;
      color += ("00" + value.toString(16)).substr(-2);
    }
    return color;
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
    textTag.setAttribute("fill", this.pickTextColorBasedOnBgColor());
    textTag.setAttribute(
      "font-family",
      '"Open Sans","Helvetica Neue",Helvetica,Arial,' +
        'sans-serif,"Apple Color Emoji","Segoe UI Emoji","Segoe UI Symbol"'
    );
    textTag.textContent = character;
    textTag.style.fontWeight = this.fontWeight.toString();
    textTag.style.fontSize = this.fontSize + "px";
    return textTag;
  }

  private unicodeSafeSubstring(str: string, count: number) {
    const characters = str.match(/./gu);
    return characters != null ? characters.slice(0, count).join("") : "";
  }

  // There are a few ways to calculate text color for contrast, this one seems to fit accessibility guidelines best.
  // https://stackoverflow.com/a/3943023/6869691
  private pickTextColorBasedOnBgColor() {
    const color = this.color.charAt(0) === "#" ? this.color.substring(1, 7) : this.color;
    const r = parseInt(color.substring(0, 2), 16); // hexToR
    const g = parseInt(color.substring(2, 4), 16); // hexToG
    const b = parseInt(color.substring(4, 6), 16); // hexToB
    return r * 0.299 + g * 0.587 + b * 0.114 > 135 ? "black" : "white";
  }
}
