import { BrowserComponentState } from "../../../models/browserComponentState";
import { BrowserGroupingsComponentState } from "../../../models/browserGroupingsComponentState";

export class VaultBrowserStateServiceAbstraction {
  getBrowserGroupingComponentState: () => Promise<BrowserGroupingsComponentState>;
  setBrowserGroupingComponentState: (value: BrowserGroupingsComponentState) => Promise<void>;
  getBrowserVaultItemsComponentState: () => Promise<BrowserComponentState>;
  setBrowserVaultItemsComponentState: (value: BrowserComponentState) => Promise<void>;
}
