import { Component } from "@angular/core";

import { IntegrationType } from "@bitwarden/common/enums";
import { I18nService } from "@bitwarden/common/platform/abstractions/i18n.service";

import { Integration } from "../../../shared/components/integrations/models";

@Component({
  selector: "ac-integrations",
  templateUrl: "./integrations.component.html",
})
export class IntegrationsComponent {
  private integrationsList: Integration[] = [];

  tabIndex: number;

  constructor(i18nService: I18nService) {
    // temporary integrations
    this.integrationsList = [
      {
        name: "AD FS",
        linkURL: "https://github.com/bitwarden/sdk",
        image: "../../../../../../../images/secrets-manager/sdks/rust.svg",
        imageDarkMode: "../../../../../../../images/secrets-manager/sdks/rust-white.svg",
        type: IntegrationType.SSO,
      },
      {
        name: "Auth0",
        linkURL: "https://bitwarden.com/help/github-actions-integration/",
        image: "../../../../../../../images/secrets-manager/integrations/github.svg",
        imageDarkMode: "../../../../../../../images/secrets-manager/integrations/github-white.svg",
        type: IntegrationType.SSO,
      },
      {
        name: "AWS",
        linkURL: "https://bitwarden.com/help/gitlab-integration/",
        image: "../../../../../../../images/secrets-manager/integrations/gitlab.svg",
        imageDarkMode: "../../../../../../../images/secrets-manager/integrations/gitlab-white.svg",
        type: IntegrationType.SSO,
      },
      {
        name: "Microsoft Entra ID",
        linkURL: "https://bitwarden.com/help/ansible-integration/",
        image: "../../../../../../../images/secrets-manager/integrations/ansible.svg",
        type: IntegrationType.SSO,
      },
      {
        name: "Duo",
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/csharp",
        image: "../../../../../../../images/secrets-manager/sdks/c-sharp.svg",
        type: IntegrationType.SSO,
      },
      {
        name: "Google",
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/cpp",
        image: "../../../../../../../images/secrets-manager/sdks/c-plus-plus.png",
        type: IntegrationType.SSO,
      },
      {
        name: "JumpCloud",
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/go",
        image: "../../../../../../../images/secrets-manager/sdks/go.svg",
        type: IntegrationType.SSO,
      },
      {
        name: "KeyCloak",
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/java",
        image: "../../../../../../../images/secrets-manager/sdks/java.svg",
        imageDarkMode: "../../../../../../../images/secrets-manager/sdks/java-white.svg",
        type: IntegrationType.SSO,
      },
      {
        name: "Okta",
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/js",
        image: "../../../../../../../images/secrets-manager/sdks/wasm.svg",
        type: IntegrationType.SSO,
      },
      {
        name: "OneLogin",
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/php",
        image: "../../../../../../../images/secrets-manager/sdks/php.svg",
        type: IntegrationType.SSO,
      },
      {
        name: "PingFederate",
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/python",
        image: "../../../../../../../images/secrets-manager/sdks/python.svg",
        type: IntegrationType.SSO,
      },
      {
        name: "Ruby",
        linkURL: "https://github.com/bitwarden/sdk/tree/main/languages/ruby",
        image: "../../../../../../../images/secrets-manager/sdks/ruby.png",
        type: IntegrationType.SSO,
      },
      {
        name: "Kubernetes Operator",
        linkURL: "https://bitwarden.com/help/secrets-manager-kubernetes-operator/",
        image: "../../../../../../../images/secrets-manager/integrations/kubernetes.svg",
        type: IntegrationType.SSO,
        newBadgeExpiration: "2024-8-12",
      },
    ];
  }

  /** Filter out content for the integrations sections */
  get sso(): Integration[] {
    return this.integrationsList.filter((integration) => integration.type === IntegrationType.SSO);
  }

  /** Filter out content for the SDKs section */
  get sdks(): Integration[] {
    return this.integrationsList.filter((integration) => integration.type === IntegrationType.SSO);
  }
}
