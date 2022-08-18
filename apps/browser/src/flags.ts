// required to avoid linting errors when there are no feature flags
/* eslint-disable @typescript-eslint/ban-types */
import {
  flagEnabled as baseFlagEnabled,
  devFlagEnabled as baseDevFlagEnabled,
} from "@bitwarden/common/misc/flags";

import { GroupPolicyEnvironment } from "./types/group-policy-environment";

export type Flags = {};

export type FlagName = keyof Flags;

export function flagEnabled(flag: FlagName) {
  return baseFlagEnabled<Flags>(flag);
}

export type DevFlags = {
  storeSessionDecrypted?: boolean;
  managedEnvironment?: GroupPolicyEnvironment;
};

export type DevFlagName = keyof DevFlags;

export function devFlagEnabled(flag: DevFlagName) {
  return baseDevFlagEnabled<DevFlags>(flag);
}

/**
 * Gets the value of a dev flag from environment.
 * Will always return false unless in development.
 * @param flag The name of the dev flag to check
 * @returns The value of the flag
 * @throws Error if the flag is not enabled
 */
export function devFlagValue<K extends DevFlagName>(flag: K): DevFlags[K] {
  if (!devFlagEnabled(flag)) {
    throw new Error(`This method should not be called, it is protected by a disabled dev flag.`);
  }

  const devFlags = getFlags<DevFlags>(process.env.DEV_FLAGS);
  return devFlags[flag];
}
