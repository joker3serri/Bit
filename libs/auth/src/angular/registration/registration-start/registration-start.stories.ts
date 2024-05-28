import { importProvidersFrom } from "@angular/core";
import { ReactiveFormsModule } from "@angular/forms";
import { ActivatedRoute, Params } from "@angular/router";
import { RouterTestingModule } from "@angular/router/testing";
import { Meta, StoryObj, applicationConfig, moduleMetadata } from "@storybook/angular";
import { of } from "rxjs";

import { ClientType } from "@bitwarden/common/enums";
import {
  Environment,
  EnvironmentService,
  Region,
  Urls,
} from "@bitwarden/common/platform/abstractions/environment.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";
import {
  DialogModule,
  FormFieldModule,
  SelectModule,
  ToastOptions,
  ToastService,
} from "@bitwarden/components";

import { PreloadedEnglishI18nModule } from "../../../../../../apps/web/src/app/core/tests";

import { RegistrationStartComponent } from "./registration-start.component";

export default {
  title: "Auth/Registration/Registration Start",
  component: RegistrationStartComponent,
} as Meta;

const decorators = (options: {
  isSelfHost: boolean;
  queryParams: Params;
  clientType?: ClientType;
  defaultRegion?: Region;
}) => {
  return [
    moduleMetadata({
      imports: [
        RouterTestingModule,
        DialogModule,
        ReactiveFormsModule,
        FormFieldModule,
        SelectModule,
      ],
      providers: [
        {
          provide: ActivatedRoute,
          useValue: { queryParams: of(options.queryParams) },
        },
        {
          provide: PlatformUtilsService,
          useValue: {
            isSelfHost: () => options.isSelfHost,
            getClientType: () => options.clientType || ClientType.Web,
          } as Partial<PlatformUtilsService>,
        },
        {
          provide: EnvironmentService,
          useValue: {
            environment$: of({
              getRegion: () => options.defaultRegion || Region.US,
            } as Partial<Environment>),
            availableRegions: () => [
              { key: Region.US, domain: "bitwarden.com", urls: {} },
              { key: Region.EU, domain: "bitwarden.eu", urls: {} },
            ],
            setEnvironment: (region: Region, urls?: Urls) => Promise.resolve({}),
          } as Partial<EnvironmentService>,
        },
        {
          provide: ToastService,
          useValue: {
            showToast: (options: ToastOptions) => {},
          } as Partial<ToastService>,
        },
      ],
    }),
    applicationConfig({
      providers: [importProvidersFrom(PreloadedEnglishI18nModule)],
    }),
  ];
};

type Story = StoryObj<RegistrationStartComponent>;

export const CloudExample: Story = {
  render: (args) => ({
    props: args,
    template: `
      <auth-registration-start></auth-registration-start>
      `,
  }),
  decorators: decorators({ isSelfHost: false, queryParams: {} }),
};

export const SelfHostExample: Story = {
  render: (args) => ({
    props: args,
    template: `
      <auth-registration-start></auth-registration-start>
      `,
  }),
  decorators: decorators({ isSelfHost: true, queryParams: {} }),
};

export const QueryParamsExample: Story = {
  render: (args) => ({
    props: args,
    template: `
      <auth-registration-start></auth-registration-start>
      `,
  }),
  decorators: decorators({
    isSelfHost: false,
    queryParams: { email: "jaredWasHere@bitwarden.com", emailReadonly: "true" },
  }),
};
