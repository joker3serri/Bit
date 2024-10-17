import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";

import { EnvironmentSelectorComponent } from "@bitwarden/angular/auth/components/environment-selector.component";
import { unauthUiRefreshSwap } from "@bitwarden/angular/auth/functions/unauth-ui-refresh-route-swap";
import {
  authGuard,
  lockGuard,
  redirectGuard,
  tdeDecryptionRequiredGuard,
  unauthGuardFn,
} from "@bitwarden/angular/auth/guards";
import { canAccessFeature } from "@bitwarden/angular/platform/guard/feature-flag.guard";
import { extensionRefreshRedirect } from "@bitwarden/angular/utils/extension-refresh-redirect";
import {
  AnonLayoutWrapperComponent,
  AnonLayoutWrapperData,
  DevicesIcon,
  LockIcon,
  LockV2Component,
  LoginViaAuthRequestComponent,
  PasswordHintComponent,
  RegistrationFinishComponent,
  RegistrationStartComponent,
  RegistrationStartSecondaryComponent,
  RegistrationStartSecondaryComponentData,
  SetPasswordJitComponent,
  UserLockIcon,
} from "@bitwarden/auth/angular";
import { FeatureFlag } from "@bitwarden/common/enums/feature-flag.enum";

import { twofactorRefactorSwap } from "../../../../libs/angular/src/utils/two-factor-component-refactor-route-swap";
import { AccessibilityCookieComponent } from "../auth/accessibility-cookie.component";
import { maxAccountsGuardFn } from "../auth/guards/max-accounts.guard";
import { HintComponent } from "../auth/hint.component";
import { LockComponent } from "../auth/lock.component";
import { LoginDecryptionOptionsComponent } from "../auth/login/login-decryption-options/login-decryption-options.component";
import { LoginViaAuthRequestComponentV1 } from "../auth/login/login-via-auth-request-v1.component";
import { LoginComponent } from "../auth/login/login.component";
import { RegisterComponent } from "../auth/register.component";
import { RemovePasswordComponent } from "../auth/remove-password.component";
import { SetPasswordComponent } from "../auth/set-password.component";
import { SsoComponent } from "../auth/sso.component";
import { TwoFactorAuthComponent } from "../auth/two-factor-auth.component";
import { TwoFactorComponent } from "../auth/two-factor.component";
import { UpdateTempPasswordComponent } from "../auth/update-temp-password.component";
import { VaultComponent } from "../vault/app/vault/vault.component";

import { SendComponent } from "./tools/send/send.component";

/**
 * Data properties acceptable for use in route objects in the desktop
 */
export interface RouteDataProperties {
  // For any new route data properties, add them here.
  // then assert that the data object satisfies this interface in the route object.
}

const routes: Routes = [
  {
    path: "",
    pathMatch: "full",
    children: [], // Children lets us have an empty component.
    canActivate: [redirectGuard({ loggedIn: "/vault", loggedOut: "/login", locked: "/lock" })],
  },
  {
    path: "lock",
    component: LockComponent,
    canActivate: [lockGuard()],
    canMatch: [extensionRefreshRedirect("/lockV2")],
  },
  {
    path: "login",
    component: LoginComponent,
    canActivate: [maxAccountsGuardFn()],
  },
  ...twofactorRefactorSwap(
    TwoFactorComponent,
    AnonLayoutWrapperComponent,
    {
      path: "2fa",
    },
    {
      path: "2fa",
      component: AnonLayoutWrapperComponent,
      children: [
        {
          path: "",
          component: TwoFactorAuthComponent,
          canActivate: [unauthGuardFn()],
        },
      ],
    },
  ),
  {
    path: "login-initiated",
    component: LoginDecryptionOptionsComponent,
    canActivate: [tdeDecryptionRequiredGuard()],
  },
  { path: "register", component: RegisterComponent },
  {
    path: "vault",
    component: VaultComponent,
    canActivate: [authGuard],
  },
  { path: "accessibility-cookie", component: AccessibilityCookieComponent },
  { path: "set-password", component: SetPasswordComponent },
  { path: "sso", component: SsoComponent },
  {
    path: "send",
    component: SendComponent,
    canActivate: [authGuard],
  },
  {
    path: "update-temp-password",
    component: UpdateTempPasswordComponent,
    canActivate: [authGuard],
  },
  {
    path: "remove-password",
    component: RemovePasswordComponent,
    canActivate: [authGuard],
  },
  ...unauthUiRefreshSwap(
    LoginViaAuthRequestComponentV1,
    AnonLayoutWrapperComponent,
    {
      path: "login-with-device",
      component: LoginViaAuthRequestComponentV1,
    },
    {
      path: "login-with-device",
      data: {
        pageIcon: DevicesIcon,
        pageTitle: {
          key: "loginInitiated",
        },
        pageSubtitle: {
          key: "aNotificationWasSentToYourDevice",
        },
      } satisfies AnonLayoutWrapperData,
      children: [
        { path: "", component: LoginViaAuthRequestComponent },
        {
          path: "",
          component: EnvironmentSelectorComponent,
          outlet: "environment-selector",
        },
      ],
    },
  ),
  ...unauthUiRefreshSwap(
    LoginViaAuthRequestComponentV1,
    AnonLayoutWrapperComponent,
    {
      path: "admin-approval-requested",
      component: LoginViaAuthRequestComponentV1,
    },
    {
      path: "admin-approval-requested",
      data: {
        pageIcon: DevicesIcon,
        pageTitle: {
          key: "adminApprovalRequested",
        },
        pageSubtitle: {
          key: "adminApprovalRequestSentToAdmins",
        },
      } satisfies AnonLayoutWrapperData,
      children: [
        { path: "", component: LoginViaAuthRequestComponent },
        {
          path: "",
          component: EnvironmentSelectorComponent,
          outlet: "environment-selector",
        },
      ],
    },
  ),
  ...unauthUiRefreshSwap(
    HintComponent,
    AnonLayoutWrapperComponent,
    {
      path: "hint",
      canActivate: [unauthGuardFn()],
    },
    {
      path: "",
      children: [
        {
          path: "hint",
          canActivate: [unauthGuardFn()],
          data: {
            pageTitle: {
              key: "requestPasswordHint",
            },
            pageSubtitle: {
              key: "enterYourAccountEmailAddressAndYourPasswordHintWillBeSentToYou",
            },
            pageIcon: UserLockIcon,
          } satisfies AnonLayoutWrapperData,
          children: [
            { path: "", component: PasswordHintComponent },
            {
              path: "",
              component: EnvironmentSelectorComponent,
              outlet: "environment-selector",
            },
          ],
        },
      ],
    },
  ),
  {
    path: "",
    component: AnonLayoutWrapperComponent,
    children: [
      {
        path: "signup",
        canActivate: [canAccessFeature(FeatureFlag.EmailVerification), unauthGuardFn()],
        data: {
          pageTitle: {
            key: "createAccount",
          },
        } satisfies AnonLayoutWrapperData,
        children: [
          {
            path: "",
            component: RegistrationStartComponent,
          },
          {
            path: "",
            component: RegistrationStartSecondaryComponent,
            outlet: "secondary",
            data: {
              loginRoute: "/login",
            } satisfies RegistrationStartSecondaryComponentData,
          },
        ],
      },
      {
        path: "finish-signup",
        canActivate: [canAccessFeature(FeatureFlag.EmailVerification), unauthGuardFn()],
        data: {
          pageTitle: {
            key: "setAStrongPassword",
          },
          pageSubtitle: {
            key: "finishCreatingYourAccountBySettingAPassword",
          },
        } satisfies AnonLayoutWrapperData,
        children: [
          {
            path: "",
            component: RegistrationFinishComponent,
          },
        ],
      },
      {
        path: "lockV2",
        canActivate: [canAccessFeature(FeatureFlag.ExtensionRefresh), lockGuard()],
        data: {
          pageIcon: LockIcon,
          pageTitle: {
            key: "yourVaultIsLockedV2",
          },
          showReadonlyHostname: true,
        } satisfies AnonLayoutWrapperData,
        children: [
          {
            path: "",
            component: LockV2Component,
          },
        ],
      },
      {
        path: "set-password-jit",
        canActivate: [canAccessFeature(FeatureFlag.EmailVerification)],
        component: SetPasswordJitComponent,
        data: {
          pageTitle: {
            key: "joinOrganization",
          },
          pageSubtitle: {
            key: "finishJoiningThisOrganizationBySettingAMasterPassword",
          },
        } satisfies AnonLayoutWrapperData,
      },
    ],
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, {
      useHash: true,
      /*enableTracing: true,*/
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}
