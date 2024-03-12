import { CommonModule } from "@angular/common";
import { Component, importProvidersFrom } from "@angular/core";
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from "@angular/forms";
import { RouterModule } from "@angular/router";
import { NgSelectModule } from "@ng-select/ng-select";
import { action } from "@storybook/addon-actions";
import {
  Meta,
  StoryObj,
  applicationConfig,
  componentWrapperDecorator,
  moduleMetadata,
} from "@storybook/angular";

import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { AvatarModule } from "../../avatar";
import { BadgeModule } from "../../badge";
import { BannerModule } from "../../banner";
import { BreadcrumbsModule } from "../../breadcrumbs";
import { ButtonModule } from "../../button";
import { CalloutModule } from "../../callout";
import { CheckboxModule } from "../../checkbox";
import { ColorPasswordModule } from "../../color-password";
import { FormControlModule } from "../../form-control";
import { FormFieldModule } from "../../form-field";
import { IconModule } from "../../icon";
import { IconButtonModule } from "../../icon-button";
import { InputModule } from "../../input";
import { LayoutComponent } from "../../layout";
import { LinkModule } from "../../link";
import { MenuModule } from "../../menu";
import { MultiSelectModule } from "../../multi-select";
import { NavigationModule } from "../../navigation";
import { NoItemsModule } from "../../no-items";
import { PopoverModule } from "../../popover";
import { ProgressModule } from "../../progress";
import { RadioButtonModule } from "../../radio-button";
import { SearchModule } from "../../search";
import { SectionComponent } from "../../section";
import { SelectModule } from "../../select";
import { SharedModule } from "../../shared";
import { TableModule } from "../../table";
import { TabsModule } from "../../tabs";
import { ToggleGroupModule } from "../../toggle-group";
import { TypographyModule } from "../../typography";
import { I18nMockService } from "../../utils/i18n-mock.service";

@Component({
  selector: "bit-tab-main",
  // TODO fix layout main scroll and get rid of this hardcoded style
  template: `<div style="height: 92vh">
    <bit-section>
      <p>
        <bit-breadcrumbs [show]="show">
          <bit-breadcrumb *ngFor="let item of navItems" [icon]="item.icon" [route]="[item.route]">
            {{ item.name }}
          </bit-breadcrumb>
        </bit-breadcrumbs>
      </p>
      <bit-banner bannerType="info"> This content is very important </bit-banner>
      <div class="tw-text-center tw-mb-6 tw-mt-6">
        <h1 bitTypography="h1" class="tw-text-main">
          Bitwarden <bit-avatar text="Bit Warden"></bit-avatar>
        </h1>
        <a bitLink linkType="primary" href="#">Learn more</a>
      </div>

      <bit-tab-group label="Main content tabs" class="tw-text-main">
        <bit-tab label="Evaluation">
          <h2 bitTypography="h2" class="tw-text-main tw-text-center tw-mt-6 tw-mb-6">About</h2>
          <div>
            <bit-table>
              <ng-container header>
                <tr>
                  <th bitCell>Product</th>
                  <th bitCell>User</th>
                  <th bitCell>Options</th>
                </tr>
              </ng-container>
              <ng-template body>
                <tr bitRow>
                  <td bitCell>Password Manager</td>
                  <td bitCell>Everyone</td>
                  <td bitCell>
                    <button
                      bitIconButton="bwi-ellipsis-v"
                      [bitMenuTriggerFor]="menu1"
                      appA11yTitle="options"
                    ></button>
                    <bit-menu #menu1>
                      <a href="#" bitMenuItem>Anchor link</a>
                      <a href="#" bitMenuItem>Another link</a>
                      <bit-menu-divider></bit-menu-divider>
                      <button type="button" bitMenuItem>Button after divider</button>
                    </bit-menu>
                  </td>
                </tr>
                <tr bitRow>
                  <td bitCell>Secrets Manager</td>
                  <td bitCell>Developers</td>
                  <td bitCell>
                    <button
                      bitIconButton="bwi-ellipsis-v"
                      [bitMenuTriggerFor]="menu2"
                      appA11yTitle="options"
                    ></button>
                    <bit-menu #menu2>
                      <a href="#" bitMenuItem>Anchor link</a>
                      <a href="#" bitMenuItem>Another link</a>
                      <bit-menu-divider></bit-menu-divider>
                      <button type="button" bitMenuItem>Button after divider</button>
                    </bit-menu>
                  </td>
                </tr>
              </ng-template>
            </bit-table>
            <h2 bitTypography="h2" class="tw-text-main tw-text-center tw-mt-6 tw-mb-6">
              Companies using Bitwarden
            </h2>
            <div class="tw-mt-6 tw-mb-6 tw-flex tw-justify-center">
              <bit-toggle-group [(selected)]="selectedToggle" aria-label="Company list filter">
                <bit-toggle value="all"> All <span bitBadge variant="info">3</span> </bit-toggle>

                <bit-toggle value="large">
                  Enterprise <span bitBadge variant="info">2</span>
                </bit-toggle>

                <bit-toggle value="small">
                  Mid-sized <span bitBadge variant="info">1</span>
                </bit-toggle>
              </bit-toggle-group>
            </div>
            <ul *ngFor="let company of companyList">
              <li *ngIf="company.size === selectedToggle || selectedToggle === 'all'">
                {{ company.name }}
              </li>
            </ul>
            <h2 bitTypography="h2" class="tw-text-main tw-text-center tw-mt-6 tw-mb-6">Survey</h2>
            <bit-main-form></bit-main-form>
          </div>
        </bit-tab>
        <bit-tab label="Empty tab">
          <bit-callout type="info" title="Notice"> Under construction </bit-callout>
          <bit-no-items class="tw-text-main">
            <ng-container slot="title">This tab is empty</ng-container>
            <ng-container slot="description">
              <p bitTypography="body2">Try searching for what you are looking for:</p>
              <bit-search [(ngModel)]="searchText" [placeholder]="placeholder"></bit-search>
              <p bitTypography="helper">Note that the search bar is not functional</p>
            </ng-container>
          </bit-no-items>
        </bit-tab>
      </bit-tab-group>
    </bit-section>
  </div>`,
})
class MainComponent {
  selectedToggle: "all" | "large" | "small" = "all";

  companyList = [
    { name: "A large enterprise company", size: "large" },
    { name: "Another enterprise company", size: "large" },
    { name: "A smaller company", size: "small" },
  ];

  navItems = [
    { icon: "bwi-collection", name: "Password Managers", route: "/" },
    { icon: "bwi-collection", name: "Favorites", route: "/" },
  ];
}

@Component({
  selector: "bit-main-form",
  template: `<form [formGroup]="formObj" (ngSubmit)="submit()">
    <div class="tw-mb-6">
      <bit-progress barWidth="50"></bit-progress>
    </div>

    <bit-form-field>
      <bit-label>Your favorite feature</bit-label>
      <input bitInput formControlName="favFeature" />
    </bit-form-field>

    <bit-form-field>
      <bit-label>Your favorite color</bit-label>
      <bit-select formControlName="favColor">
        <bit-option
          *ngFor="let color of colors"
          [value]="color.value"
          [label]="color.name"
        ></bit-option>
      </bit-select>
    </bit-form-field>

    <bit-form-field>
      <bit-label>Your top 3 worst passwords</bit-label>
      <bit-multi-select
        class="tw-w-full"
        formControlName="topWorstPasswords"
        [baseItems]="worstPasswords"
        (onItemsConfirmed)="onItemsConfirmed($event)"
      >
      </bit-multi-select>
    </bit-form-field>

    <bit-form-field>
      <bit-label>How many passwords do you have?</bit-label>
      <input bitInput type="number" formControlName="numPasswords" min="0" max="150" />
    </bit-form-field>

    <bit-form-field>
      <bit-label>
        A random password
        <button
          type="button"
          class="tw-border-none tw-bg-transparent tw-text-primary-500"
          [bitPopoverTriggerFor]="myPopover"
          #triggerRef="popoverTrigger"
        >
          <i class="bwi bwi-question-circle"></i>
        </button>
      </bit-label>
      <input bitInput type="password" formControlName="password" />
      <button
        type="button"
        bitIconButton
        bitSuffix
        bitPasswordInputToggle
        [(toggled)]="toggled"
      ></button>
    </bit-form-field>

    <span bitTypography="body1" class="tw-text-main">An example of a strong password: &nbsp;</span>

    <bit-color-password
      class="tw-text-base"
      [password]="'Wq$Jk😀7j  DX#rS5Sdi!z'"
      [showCount]="true"
    ></bit-color-password>

    <br />
    <br />

    <bit-form-control>
      <bit-label>Check if you love security</bit-label>
      <input type="checkbox" bitCheckbox formControlName="loveSecurity" />
      <bit-hint>Required!!!!!</bit-hint>
    </bit-form-control>

    <bit-radio-group formControlName="current">
      <bit-label>Do you currently use Bitwarden?</bit-label>
      <bit-radio-button value="yes">
        <bit-label>Yes</bit-label>
      </bit-radio-button>
      <bit-radio-button value="no">
        <bit-label>No</bit-label>
      </bit-radio-button>
    </bit-radio-group>

    <button type="submit" bitButton buttonType="primary" (click)="(submit)">Submit</button>
    <bit-error-summary [formGroup]="formObj"></bit-error-summary>

    <bit-popover [title]="'Password help'" #myPopover>
      <div>A strong password has the following:</div>
      <ul class="tw-mt-2 tw-mb-0 tw-pl-4">
        <li>Letters</li>
        <li>Numbers</li>
        <li>Special characters</li>
      </ul>
    </bit-popover>
  </form>`,
})
class MainForm {
  formObj = new FormBuilder().group({
    favFeature: ["", [Validators.required]],
    favColor: [undefined as string | undefined, [Validators.required]],
    topWorstPasswords: [undefined as string | undefined],
    loveSecurity: [false, [Validators.requiredTrue]],
    current: ["yes"],
    numPasswords: [null, [Validators.min(0), Validators.max(150)]],
    password: ["", [Validators.required]],
  });

  submit = () => this.formObj.markAllAsTouched();

  onItemsConfirmed = action("onItemsConfirmed");

  colors = [
    { value: "blue", name: "Blue" },
    { value: "white", name: "White" },
    { value: "gray", name: "Gray" },
  ];

  worstPasswords = [
    { id: "1", listName: "1234", labelName: "1234" },
    { id: "2", listName: "admin", labelName: "admin" },
    { id: "3", listName: "password", labelName: "password" },
  ];
}

export default {
  title: "Documentation / Kitchen Sink",
  component: LayoutComponent,
  decorators: [
    componentWrapperDecorator(
      /**
       * Applying a CSS transform makes a `position: fixed` element act like it is `position: relative`
       * https://github.com/storybookjs/storybook/issues/8011#issue-490251969
       */
      (story) =>
        /* HTML */ `<div class="tw-scale-100 tw-border-2 tw-border-solid tw-border-[red]">
          ${story}
        </div>`,
    ),
    moduleMetadata({
      declarations: [MainComponent, MainForm],
      imports: [
        AvatarModule,
        BadgeModule,
        BannerModule,
        BreadcrumbsModule,
        ButtonModule,
        CommonModule,
        CalloutModule,
        CheckboxModule,
        ColorPasswordModule,
        FormControlModule,
        FormFieldModule,
        FormsModule,
        IconButtonModule,
        IconModule,
        InputModule,
        LayoutComponent,
        LinkModule,
        MenuModule,
        MultiSelectModule,
        NavigationModule,
        NgSelectModule,
        NoItemsModule,
        PopoverModule,
        ProgressModule,
        RadioButtonModule,
        ReactiveFormsModule,
        RouterModule,
        SearchModule,
        SectionComponent,
        SelectModule,
        SharedModule,
        TableModule,
        TabsModule,
        ToggleGroupModule,
        TypographyModule,
      ],
      providers: [
        {
          provide: I18nService,
          useFactory: () => {
            return new I18nMockService({
              close: "Close",
              checkboxRequired: "Option is required",
              fieldsNeedAttention: "__$1__ field(s) above need your attention.",
              inputEmail: "Input is not an email-address.",
              inputMaxValue: (max) => `Input value must not exceed ${max}.`,
              inputMinValue: (min) => `Input value must be at least ${min}.`,
              inputRequired: "Input is required.",
              multiSelectClearAll: "Clear all",
              multiSelectLoading: "Retrieving options...",
              multiSelectNotFound: "No items found",
              multiSelectPlaceholder: "-- Type to Filter --",
              required: "required",
              search: "Search",
              selectPlaceholder: "-- Select --",
              skipToContent: "Skip to content",
              submenu: "submenu",
              toggleCollapse: "toggle collapse",
              toggleVisibility: "Toggle visibility",
            });
          },
        },
      ],
    }),
    applicationConfig({
      providers: [
        importProvidersFrom(
          RouterModule.forRoot(
            [
              { path: "", redirectTo: "bitwarden", pathMatch: "full" },
              { path: "bitwarden", component: MainComponent },
            ],
            { useHash: true },
          ),
        ),
      ],
    }),
  ],
} as Meta;

type Story = StoryObj<LayoutComponent>;

export const Default: Story = {
  render: (args) => {
    return {
      props: args,
      template: /* HTML */ `<bit-layout>
        <nav slot="sidebar">
          <bit-nav-group text="Password Managers" icon="bwi-collection" [open]="true">
            <bit-nav-group text="Favorites" icon="bwi-collection" variant="tree" [open]="true">
              <bit-nav-item text="Bitwarden" route="bitwarden"></bit-nav-item>
              <bit-nav-divider></bit-nav-divider>
            </bit-nav-group>
          </bit-nav-group>
        </nav>
        <router-outlet></router-outlet>
      </bit-layout>`,
    };
  },
};
