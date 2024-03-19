import {
  AUTOFILL_SETTINGS_DISK,
  KeyDefinition,
  StateProvider,
} from "@bitwarden/common/platform/state";

const ENABLE_DUCK_DUCK_GO_BROWSER_INTEGRATION = new KeyDefinition(
  AUTOFILL_SETTINGS_DISK,
  "enableDuckDuckGoBrowserIntegration",
  {
    deserializer: (value: boolean) => value ?? false,
  },
);

export class DesktopAutofillSettingsService {
  private enableDuckDuckGoBrowserIntegrationState = this.stateProvider.getGlobal(
    ENABLE_DUCK_DUCK_GO_BROWSER_INTEGRATION,
  );
  readonly enableDuckDuckGoBrowserIntegration$ =
    this.enableDuckDuckGoBrowserIntegrationState.state$;

  constructor(private stateProvider: StateProvider) {}

  async setEnableDuckDuckGoBrowserIntegration(newValue: boolean): Promise<void> {
    await this.enableDuckDuckGoBrowserIntegrationState.update(() => newValue);
  }
}
