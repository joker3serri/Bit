import { MockProxy, mock } from "jest-mock-extended";

import { PolicyService } from "@bitwarden/common/admin-console/abstractions/policy/policy.service.abstraction";
import { AuthService } from "@bitwarden/common/auth/abstractions/auth.service";
import { ConfigService } from "@bitwarden/common/platform/abstractions/config/config.service";
import { LogService } from "@bitwarden/common/platform/abstractions/log.service";
import { PlatformUtilsService } from "@bitwarden/common/platform/abstractions/platform-utils.service";

import { ScriptInjectorService } from "../../platform/services/abstractions/script-injector.service";
import { AutofillService } from "../services/abstractions/autofill.service";

import { AutoSubmitLoginBackground } from "./auto-submit-login.background";

describe("AutoSubmitLoginBackground", () => {
  let logService: MockProxy<LogService>;
  let autofillService: MockProxy<AutofillService>;
  let scriptInjectorService: MockProxy<ScriptInjectorService>;
  let authService: MockProxy<AuthService>;
  let configService: MockProxy<ConfigService>;
  let platformUtilsService: MockProxy<PlatformUtilsService>;
  let policyService: MockProxy<PolicyService>;
  let autoSubmitLoginBackground: AutoSubmitLoginBackground;

  beforeEach(() => {
    logService = mock<LogService>();
    autofillService = mock<AutofillService>();
    scriptInjectorService = mock<ScriptInjectorService>();
    authService = mock<AuthService>();
    configService = mock<ConfigService>({
      getFeatureFlag: jest.fn().mockResolvedValue(true),
    });
    platformUtilsService = mock<PlatformUtilsService>();
    policyService = mock<PolicyService>();
    autoSubmitLoginBackground = new AutoSubmitLoginBackground(
      logService,
      autofillService,
      scriptInjectorService,
      authService,
      configService,
      platformUtilsService,
      policyService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("init", () => {
    it("skips triggering the auto submit login setup when the feature flag is not enabled", async () => {
      configService.getFeatureFlag.mockResolvedValue(false);

      await autoSubmitLoginBackground.init();

      expect(scriptInjectorService.inject).not.toHaveBeenCalled();
    });
  });
});
