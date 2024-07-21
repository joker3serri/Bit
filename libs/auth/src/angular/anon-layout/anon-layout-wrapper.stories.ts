import { importProvidersFrom, Component } from "@angular/core";
import { Data } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { Meta, StoryObj, applicationConfig, moduleMetadata } from "@storybook/angular";
import { of } from "rxjs";

import { ClientType } from "@bitwarden/common/enums";
import {
  EnvironmentService,
  Environment,
} from "@bitwarden/common/platform/abstractions/environment.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import { ThemeType } from "@bitwarden/common/platform/enums";
import { ThemeStateService } from "@bitwarden/common/platform/theming/theme-state.service";
import { TypographyModule } from "@bitwarden/components";

import { PreloadedEnglishI18nModule } from "../../../../../apps/web/src/app/core/tests";
import { LockIcon } from "../icons";

import { AnonLayoutWrapperDataService } from "./anon-layout-wrapper-data.service";
import { AnonLayoutWrapperComponent, AnonLayoutWrapperData } from "./anon-layout-wrapper.component";
import { DefaultAnonLayoutWrapperDataService } from "./default-anon-layout-wrapper-data.service";

@Component({
  selector: "app-dummy",
  template: "<p>Dummy Component Content</p>",
})
export class DummyComponent {
  constructor() {}
}

// const routes: Routes = [
//   {
//     path: "",
//     redirectTo: "dummy",
//     pathMatch: "full",
//   },
//   {
//     path: "",
//     component: AnonLayoutWrapperComponent,
//     children: [
//       {
//         path: "dummy",
//         component: DummyComponent,
//         data: {
//           pageTitle: "setAStrongPassword",
//           pageSubtitle: "finishCreatingYourAccountBySettingAPassword",
//           pageIcon: LockIcon,
//         },
//       },
//     ],
//   },
// ];

// @NgModule({
//   imports: [RouterModule.forRoot(routes)],
//   exports: [RouterModule],
// })
// export class StorybookAppRoutingModule {}

export default {
  title: "Auth/Anon Layout Wrapper",
  component: AnonLayoutWrapperComponent,
} as Meta;

const decorators = (options: {
  isSelfHost?: boolean;
  firstChildData?: Data;
  applicationVersion?: string;
  clientType?: ClientType;
  hostName?: string;
  themeType?: ThemeType;
}) => {
  return [
    moduleMetadata({
      declarations: [DummyComponent],
      imports: [
        RouterTestingModule.withRoutes([
          // {
          //   path: "",
          //   redirectTo: "dummy",
          //   pathMatch: "full",
          // },
          {
            path: "",
            component: AnonLayoutWrapperComponent,
            children: [
              {
                path: "",
                data: {
                  pageTitle: "setAStrongPassword",
                  pageSubtitle: "finishCreatingYourAccountBySettingAPassword",
                  pageIcon: LockIcon,
                } satisfies AnonLayoutWrapperData,
                children: [{ path: "", component: DummyComponent }],
              },
            ],
          },
        ]),
        // StorybookAppRoutingModule,
        TypographyModule,
      ],
      providers: [
        {
          provide: AnonLayoutWrapperDataService,
          useClass: DefaultAnonLayoutWrapperDataService,
        },
        {
          provide: EnvironmentService,
          useValue: {
            environment$: of({
              getHostname: () => options.hostName || "storybook.bitwarden.com",
            } as Partial<Environment>),
          } as Partial<EnvironmentService>,
        },
        {
          provide: PlatformUtilsService,
          useValue: {
            getApplicationVersion: () =>
              Promise.resolve(options.applicationVersion || "FAKE_APP_VERSION"),
            getClientType: () => options.clientType || ClientType.Web,
          } as Partial<PlatformUtilsService>,
        },
        {
          provide: ThemeStateService,
          useValue: {
            selectedTheme$: of(options.themeType || ThemeType.Light),
          } as Partial<ThemeStateService>,
        },
      ],
    }),
    applicationConfig({
      providers: [importProvidersFrom(PreloadedEnglishI18nModule)],
    }),
  ];
};

type Story = StoryObj<AnonLayoutWrapperComponent>;

export const Example: Story = {
  render: (args) => ({
    props: args,
  }),
  decorators: decorators({
    firstChildData: {
      pageTitle: "setAStrongPassword",
      pageSubtitle: "finishCreatingYourAccountBySettingAPassword",
      pageIcon: LockIcon,
    },
  }),
};
