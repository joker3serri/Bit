import { RouterModule } from "@angular/router";
import { Meta, Story, moduleMetadata } from "@storybook/angular";

import { JslibModule } from "@bitwarden/angular/jslib.module";
import { LinkModule, IconModule, ProgressModule } from "@bitwarden/components";
import { PreloadedEnglishI18nModule } from "@bitwarden/web-vault/app/tests/preloaded-english-i18n.module";

import { OnboardingTaskComponent } from "./onboarding-task.component";
import { OnboardingComponent } from "./onboarding.component";

export default {
  title: "Web/Onboarding",
  component: OnboardingComponent,
  decorators: [
    moduleMetadata({
      imports: [
        JslibModule,
        RouterModule.forRoot(
          [
            {
              path: "",
              component: OnboardingComponent,
            },
          ],
          { useHash: true }
        ),
        LinkModule,
        IconModule,
        ProgressModule,
        PreloadedEnglishI18nModule,
      ],
      declarations: [OnboardingTaskComponent],
    }),
  ],
} as Meta;

export const Empty: Story = (args) => ({
  props: args,
  template: `
    <sm-onboarding title="Get started">
        <sm-onboarding-task title="Foo"></sm-onboarding-task>
        <sm-onboarding-task title="Bar"></sm-onboarding-task>
    </sm-onboarding>
  `,
});

export const Partial: Story = (args) => ({
  props: args,
  template: `
      <sm-onboarding title="Get started">
          <sm-onboarding-task title="Foo"></sm-onboarding-task>
          <sm-onboarding-task title="Bar" [completed]="true"></sm-onboarding-task>
      </sm-onboarding>
    `,
});

export const Full: Story = (args) => ({
  props: args,
  template: `
      <sm-onboarding title="Get started">
          <sm-onboarding-task title="Bar" [completed]="true"></sm-onboarding-task>
          <sm-onboarding-task title="Bar" [completed]="true"></sm-onboarding-task>
          <sm-onboarding-task title="Bar" [completed]="true"></sm-onboarding-task>
          <sm-onboarding-task title="Bar" [completed]="true"></sm-onboarding-task>
          <sm-onboarding-task title="Bar" [completed]="true"></sm-onboarding-task>
      </sm-onboarding>
    `,
});
