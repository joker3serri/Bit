import { BrowserApi } from "../browser/browserApi";

export const clearClipboardAlarmName = "clearClipboard";

export class ClearClipboard {
  static async run() {
    const activeTabs = await BrowserApi.getActiveTabs();
    if (!activeTabs || activeTabs.length === 0) {
      return;
    }

    BrowserApi.sendTabsMessage(activeTabs[0].id, {
      command: "clearClipboard",
    });
  }
}
