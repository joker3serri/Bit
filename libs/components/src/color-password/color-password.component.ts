import { Component, HostBinding, Input } from "@angular/core";

import { Utils } from "@bitwarden/common/misc/utils";

type CharacterTypes = "letter" | "emoji" | "special" | "number";

@Component({
  selector: "color-password",
  template: `<div
    *ngFor="let character of passwordArray; index as i"
    [class]="getCharacterClass(character)"
  >
    <span>{{ character }}</span>
    <span *ngIf="showCount" class="tw-whitespace-nowrap tw-text-xs tw-leading-5 tw-text-main">{{
      i + 1
    }}</span>
  </div>`,
})
export class ColorPasswordComponent {
  @Input() private password: string = null;
  @Input() showCount = false;

  characterStyles: Record<CharacterTypes, string[]> = {
    emoji: [],
    letter: ["tw-text-main"],
    special: ["tw-text-danger"],
    number: ["tw-text-primary-500"],
  };

  @HostBinding("class")
  get classList() {
    return ["tw-min-w-0", "tw-whitespace-pre-wrap", "tw-break-all"];
  }

  get passwordArray() {
    // Convert to an array to handle cases that strings have special characters, i.e.: emoji.
    return Array.from(this.password);
  }

  sanitizeCharacter(character: string): string {
    switch (character) {
      case "&":
        character = "&amp;";
        break;
      case "<":
        character = "&lt;";
        break;
      case ">":
        character = "&gt;";
        break;
      case " ":
        character = "&nbsp;";
        break;
      default:
        break;
    }

    return character;
  }

  getCharacterClass(character: string) {
    const charType = this.getCharacterType(character);
    const charClass = this.characterStyles[charType].concat("tw-inline-flex");

    if (this.showCount) {
      return charClass.concat([
        "tw-inline-flex",
        "tw-flex-col",
        "tw-items-center",
        "tw-w-7",
        "tw-py-1",
        "odd:tw-bg-secondary-100",
      ]);
    }

    return charClass;
  }

  private getCharacterType(character: string): CharacterTypes {
    if (character.match(Utils.regexpEmojiPresentation)) {
      return "emoji";
    }

    if (character.match(/\d/)) {
      return "number";
    }

    const specials = ["&", "<", ">", " "];
    if (specials.includes(character) || character.match(/[^\w ]/)) {
      return "special";
    }

    return "letter";
  }
}
