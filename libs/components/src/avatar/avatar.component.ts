import { Component, Input, OnChanges, OnInit } from "@angular/core";
import { DomSanitizer } from "@angular/platform-browser";

import { CryptoFunctionService } from "@bitwarden/common/abstractions/cryptoFunction.service";
import { StateService } from "@bitwarden/common/abstractions/state.service";
import { Utils } from "@bitwarden/common/misc/utils";

type SizeTypes = "large" | "medium" | "small";

@Component({
  selector: "bit-avatar",
  template: `
    <img
      *ngIf="src"
      [src]="sanitizer.bypassSecurityTrustResourceUrl(src)"
      title="{{ data }}"
      [ngClass]="avatarClass"
      class="tw-rounded-full"
    />
  `,
})
export class AvatarComponent implements OnChanges, OnInit {
  @Input() data: string;
  @Input() email: string;
  @Input() size: SizeTypes = "large";
  @Input() charCount = 2;
  @Input() textColor = "#ffffff";
  @Input() dynamic = false;

  svgSize = 48;
  fontSize = 20;
  fontWeight = 300;
  src: string;

  constructor(
    public sanitizer: DomSanitizer,
    private cryptoFunctionService: CryptoFunctionService,
    private stateService: StateService
  ) {}

  ngOnInit() {
    if (!this.dynamic) {
      this.generate();
    }
  }

  ngOnChanges() {
    if (this.dynamic) {
      this.generate();
    }
  }

  get avatarClass(): string {
    let className = "";

    switch (this.size) {
      case "large":
        className += "tw-h-12 tw-w-12";
        break;
      case "medium":
        className += "tw-h-9 tw-w-9";
        break;
      case "small":
        className += "tw-h-7 tw-w-7";
    }

    return className;
  }

  private async generate() {
    const enableGravatars = await this.stateService.getEnableGravitars();
    if (enableGravatars && this.email != null) {
      const hashBytes = await this.cryptoFunctionService.hash(
        this.email.toLowerCase().trim(),
        "md5"
      );
      const hash = Utils.fromBufferToHex(hashBytes).toLowerCase();
      this.src = "https://www.gravatar.com/avatar/" + hash + "?s=" + this.svgSize + "&r=pg&d=retro";
    } else {
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

      const charObj = this.getCharText(chars);
      const color = this.stringToColor(upperData);
      const svg = this.getSvg(this.svgSize, color);
      svg.appendChild(charObj);
      const html = window.document.createElement("div").appendChild(svg).outerHTML;
      const svgHtml = window.btoa(unescape(encodeURIComponent(html)));
      this.src = "data:image/svg+xml;base64," + svgHtml;
    }
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

  private getSvg(size: number, color: string): HTMLElement {
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

  private getCharText(character: string): HTMLElement {
    const textTag = window.document.createElement("text");
    textTag.setAttribute("text-anchor", "middle");
    textTag.setAttribute("y", "50%");
    textTag.setAttribute("x", "50%");
    textTag.setAttribute("dy", "0.35em");
    textTag.setAttribute("pointer-events", "auto");
    textTag.setAttribute("fill", this.textColor);
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
}
