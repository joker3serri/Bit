// file location TBD, template files TBD

import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";
import { RouterModule } from "@angular/router";

import { AvatarModule } from "../avatar";
import { ButtonModule } from "../button";
import { IconButtonModule } from "../icon-button";
import { LinkModule } from "../link";
import { TypographyModule } from "../typography";

@Component({
  selector: "popup-layout",
  template: `
    <div class="tw-border tw-h-full tw-border-secondary-300 tw-border-solid tw-flex tw-flex-col">
      <ng-content select="[popupHeader]"></ng-content>
      <main class="tw-bg-background-alt tw-p-3 tw-flex-1 tw-overflow-y-scroll">
        <div class="tw-max-w-screen-sm tw-mx-auto">
          <ng-content></ng-content>
        </div>
      </main>
      <ng-content select="[popupFooter]"></ng-content>
    </div>
  `,
  standalone: true,
})
export class PopupLayoutComponent {}

@Component({
  selector: "popup-header",
  template: `
    <header class="tw-p-4 tw-border-0 tw-border-solid tw-border-b tw-border-secondary-300 ">
      <div class="tw-max-w-screen-sm tw-mx-auto tw-flex tw-justify-between">
        <div class="tw-inline-flex tw-items-center tw-gap-2 tw-h-9">
          <!-- not the right icon -->
          <i
            class="bwi bwi-angle-left tw-font-bold"
            aria-hidden="true"
            *ngIf="variant === 'sub-page'"
          ></i>
          <!-- see if this doesnt need the ! override -->
          <h1 bitTypography="h3" class="!tw-mb-0 tw-text-headers">{{ pageTitle }}</h1>
        </div>
        <div class="tw-inline-flex tw-items-center tw-gap-2 tw-h-9">
          <button bitButton *ngIf="variant === 'top-level-action'" buttonType="primary">
            <i class="bwi bwi-plus tw-font-bold" aria-hidden="true"></i>
            Add
          </button>
          <!-- TODO update icon -->
          <button bitIconButton="bwi-external-link" size="small" *ngIf="!poppedOut">Pop out</button>
          <!-- TODO reference browser/src/auth/popup/account-switching/current-account -->
          <button
            class="tw-bg-transparent tw-border-none"
            *ngIf="variant === 'top-level' || variant === 'top-level-action'"
          >
            <bit-avatar text="Ash Ketchum" size="small"></bit-avatar>
          </button>
        </div>
      </div>
    </header>
  `,
  standalone: true,
  imports: [TypographyModule, CommonModule, AvatarModule, ButtonModule, IconButtonModule],
})
export class PopupHeaderComponent {
  @Input() variant: "top-level" | "top-level-action" | "sub-page" = "top-level-action";
  @Input() pageTitle: string;
  // Not the best solution
  @Input() poppedOut: boolean = false;
  // TODO avatar Input
  // TODO button functionality
}

@Component({
  selector: "popup-footer",
  template: `
    <footer class="tw-p-3 tw-border-0 tw-border-solid tw-border-t tw-border-secondary-300">
      <div class="tw-max-w-screen-sm tw-mx-auto">
        <div class="tw-flex tw-justify-start">
          <ng-content select="[actionFooter]"></ng-content>
        </div>
      </div>
    </footer>
  `,
  standalone: true,
  imports: [],
})
export class PopupFooterComponent {}

@Component({
  selector: "popup-bottom-navigation",
  template: `
    <footer class="tw-border-0 tw-border-solid tw-border-t tw-border-secondary-300">
      <div class="tw-max-w-screen-sm tw-mx-auto">
        <div class="tw-flex tw-flex-1">
          <a
            *ngFor="let button of navButtons"
            class="tw-group tw-flex tw-flex-col tw-items-center tw-gap-1 tw-pb-2 tw-pt-3 tw-w-1/4 hover:tw-no-underline hover:tw-bg-primary-100 tw-border-2 tw-border-solid tw-border-transparent focus:tw-rounded-lg focus:tw-border-primary-500 "
            [ngClass]="rla.isActive ? 'tw-font-bold tw-text-primary-600' : 'tw-text-muted'"
            title="{{ button.label }}"
            routerLink="/{{ button.page }}"
            routerLinkActive
            #rla="routerLinkActive"
          >
            <i
              *ngIf="!rla.isActive"
              class="bwi bwi-lg bwi-{{ button.iconKey }}"
              aria-hidden="true"
            ></i>
            <i
              *ngIf="rla.isActive"
              class="bwi bwi-lg bwi-{{ button.iconKey }}-f"
              aria-hidden="true"
            ></i>
            <span
              class="tw-truncate tw-max-w-full"
              [ngClass]="!rla.isActive && 'group-hover:tw-underline'"
              >{{ button.label }}</span
            >
          </a>
        </div>
      </div>
    </footer>
  `,
  standalone: true,
  imports: [CommonModule, LinkModule, RouterModule],
})
export class PopupBottomNavigationComponent {
  // TODO button functionality

  navButtons = [
    {
      label: "Vault",
      page: "vault",
      iconKey: "lock",
    },
    {
      label: "Generatorbutverylongversion",
      page: "generator",
      iconKey: "generate",
    },
    {
      label: "Send",
      page: "send",
      iconKey: "send",
    },
    {
      label: "Settings",
      page: "settings",
      iconKey: "cog",
    },
  ];
}
