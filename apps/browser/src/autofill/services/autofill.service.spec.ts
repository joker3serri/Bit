import { mock } from "jest-mock-extended";

import { EventCollectionService } from "@bitwarden/common/abstractions/event/event-collection.service";
import { LogService } from "@bitwarden/common/abstractions/log.service";
import { SettingsService } from "@bitwarden/common/abstractions/settings.service";
import { TotpService } from "@bitwarden/common/abstractions/totp.service";
import { CipherService } from "@bitwarden/common/vault/abstractions/cipher.service";
import { CipherView } from "@bitwarden/common/vault/models/view/cipher.view";

import { BrowserStateService } from "../../services/abstractions/browser-state.service";

import AutofillService from "./autofill.service";

describe("AutofillService", () => {
  let autofillService: AutofillService;

  beforeEach(() => {
    autofillService = new AutofillService(
      mock<CipherService>(),
      mock<BrowserStateService>(),
      mock<TotpService>(),
      mock<EventCollectionService>(),
      mock<LogService>(),
      mock<SettingsService>()
    );
  });

  describe("untrusted iframe detection", () => {
    let untrustedIframe: (pageUrl: string, tabUrl: string, loginItem: CipherView) => boolean;

    beforeEach(() => {
      // Testing the private method isn't ideal but setting up full autofill details is too complex for now
      untrustedIframe = (autofillService as any).untrustedIframe;
      if (untrustedIframe == null) {
        throw new Error("autofillService.untrustedIframe is null, has it been renamed or moved?");
      }
    });

    it.todo("trusts the pageUrl if it matches the tabUrl exactly");
    it.todo("trusts the pageUrl if it is an equivalent domain of the tabUrl");
    it.todo("doesn't trust the pageUrl if it isn't an equivalent domain of the tabUrl");
    it.todo("trusts the pageUrl if it matches a saved URI with exact match settings");
    it.todo("doesn't trust the pageUrl if it doesn't match a saved URI with exact match settings");
    it.todo("what happens if something is null?");
  });
});
