import { Arg, Substitute, SubstituteOf } from "@fluffy-spoon/substitute";
import { BehaviorSubject, firstValueFrom } from "rxjs";

import { CryptoService } from "@bitwarden/common/abstractions/crypto.service";
import { ContainerService } from "@bitwarden/common/services/container.service";
import { SettingsService } from "@bitwarden/common/services/settings.service";
import { StateService } from "@bitwarden/common/services/state.service";

describe("SettingsService", () => {
  let settingsService: SettingsService;

  let cryptoService: SubstituteOf<CryptoService>;
  let stateService: SubstituteOf<StateService>;
  let activeAccount: BehaviorSubject<string>;
  let activeAccountUnlocked: BehaviorSubject<boolean>;

  beforeEach(() => {
    cryptoService = Substitute.for();
    stateService = Substitute.for();
    activeAccount = new BehaviorSubject("123");
    activeAccountUnlocked = new BehaviorSubject(true);

    stateService.getSettings().resolves({ equivalentDomains: "test" });
    stateService.activeAccount.returns(activeAccount);
    stateService.activeAccountUnlocked.returns(activeAccountUnlocked);
    (window as any).bitwardenContainerService = new ContainerService(cryptoService);

    settingsService = new SettingsService(stateService);
  });

  it("getEquivalentDomains", async () => {
    const result = await settingsService.getEquivalentDomains();

    expect(result).toEqual("test");
    expect(await firstValueFrom(settingsService.settings$)).toEqual({ equivalentDomains: "test" });
  });

  it("setEquivalentDomains", async () => {
    await settingsService.setEquivalentDomains([["test2"]]);

    stateService.received(1).setSettings(Arg.any());

    expect(await firstValueFrom(settingsService.settings$)).toEqual({
      equivalentDomains: [["test2"]],
    });
  });

  it("clear", async () => {
    await settingsService.clear();

    stateService.received(1).setSettings(Arg.any(), Arg.any());

    expect((await firstValueFrom(settingsService.settings$)).length).toBe(0);
  });
});
