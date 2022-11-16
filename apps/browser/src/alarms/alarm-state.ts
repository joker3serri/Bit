import { BrowserApi } from "../browser/browserApi";

type AlarmState = {
  clearClipboard: number | undefined;
  //TODO once implemented vaultTimeout: number | undefined;
  //TODO once implemented checkNotifications: number | undefined;
  //TODO once implemented (if necessary) processReload: number | undefined;
};

// MUST match the keys of AlarmState
export const alarmKeys = ["clearClipboard"] as const;

const alarmState: AlarmState = {
  clearClipboard: null,
};

export async function getAlarmTime(commandName: keyof AlarmState): Promise<number> {
  let alarmTime: number;
  if (BrowserApi.manifestVersion == 3) {
    const fromSessionStore = await chrome.storage.session.get(commandName);
    alarmTime = fromSessionStore[commandName];
  } else {
    alarmTime = alarmState[commandName];
  }

  return alarmTime;
}

/**
 * Registers an action that should execute after the given time has passed
 * @param commandName A command that has been previously registered with {@link AlarmState}
 * @param delay_ms The number of ms from now in which the command should execute from
 * @example
 * // setAlarmTime(clearClipboard, 5000) register the clearClipboard action which will execute when at least 5 seconds from now have passed
 */
export async function setAlarmTime(commandName: keyof AlarmState, delay_ms: number): Promise<void> {
  if (!delay_ms || delay_ms === 0) {
    await this.clearAlarmTime(commandName);
    return;
  }

  const time = Date.now() + delay_ms;
  await setAlarmTimeInternal(commandName, time);
}

export async function clearAlarmTime(commandName: keyof AlarmState): Promise<void> {
  await setAlarmTimeInternal(commandName, null);
}

async function setAlarmTimeInternal(commandName: keyof AlarmState, time: number): Promise<void> {
  if (BrowserApi.manifestVersion == 3) {
    await chrome.storage.session.set({ [commandName]: time });
  } else {
    alarmState[commandName] = time;
  }
}
