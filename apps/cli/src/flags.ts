// required to avoid linting errors when there are no feature flags
/* eslint-disable @typescript-eslint/ban-types */

import {
  flagEnabled as baseFlagEnabled,
  devFlagEnabled as baseDevFlagEnabled,
} from "@bitwarden/common/misc/flags";

export type Flags = {};

export type FlagName = keyof Flags;

export function flagEnabled(flag: FlagName) {
  return baseFlagEnabled<Flags>(flag);
}

export type DevFlags = {};

export type DevFlagName = keyof DevFlags;

export function devFlagEnabled(flag: DevFlagName) {
  return baseDevFlagEnabled<DevFlags>(flag);
}
